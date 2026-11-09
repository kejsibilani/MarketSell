/**
 * Keeps the browser's working copy of each collection in step with Supabase.
 *
 * The UI reads collections synchronously (see `loadFromLS` in
 * utils/workflowHelpers). On start-up and after sign-in we pull every
 * collection the user may see into that working copy; every save is diffed
 * against the last synced state and the changed rows are upserted / deleted.
 *
 * Without Supabase credentials all of this is a no-op and the app runs on
 * local demo data.
 */
import { supabase, isSupabaseConfigured } from './client';
import { COLLECTIONS, SYSTEM_TABLES, toRow, fromRow, type CollectionDef } from './schema';

const PAGE_SIZE = 1000;
const byKey = new Map(COLLECTIONS.map((d) => [d.storageKey, d]));
const systemKeys = new Set(SYSTEM_TABLES.map((d) => d.storageKey));

/** storageKey -> (id -> serialized row) as last confirmed by the server. */
const synced = new Map<string, Map<string, string>>();
/** Serialises writes per collection so diffs are computed in order. */
const queues = new Map<string, Promise<void>>();

export type SyncErrorDetail = { storageKey: string; message: string };

function reportError(storageKey: string, error: unknown) {
  const message = error instanceof Error ? error.message : (error as any)?.message ?? String(error);
  console.error(`[sync] ${storageKey}: ${message}`);
  window.dispatchEvent(new CustomEvent<SyncErrorDetail>('marketsell:sync-error', { detail: { storageKey, message } }));
}

export function isSyncedKey(storageKey: string) {
  return isSupabaseConfigured && (byKey.has(storageKey) || systemKeys.has(storageKey));
}

async function fetchAll(table: string) {
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase!.from(table).select('*').range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

async function pullCollection(def: CollectionDef) {
  const rows = await fetchAll(def.table);
  const records = rows.map((r) => fromRow(def, r));
  localStorage.setItem(def.storageKey, JSON.stringify(records));
  synced.set(def.storageKey, new Map(rows.map((r) => {
    const row = toRow(def, fromRow(def, r));
    return [String(row[def.pkColumn]), JSON.stringify(row)];
  })));
}

async function pullSystemTables() {
  const { data, error } = await supabase!.from('system_tables').select('key, rows');
  if (error) throw error;
  for (const { key, rows } of data ?? []) {
    if (!systemKeys.has(key)) continue;
    localStorage.setItem(key, JSON.stringify(rows));
    synced.set(key, new Map([[key, JSON.stringify(rows)]]));
  }
}

/**
 * Replace the working copy with what the current user can see on the server.
 * Collections the user cannot see come back empty, so no demo data leaks into
 * a real account.
 */
export async function pullAll() {
  if (!supabase) return;
  await Promise.all([
    ...COLLECTIONS.map((def) => pullCollection(def).catch((e) => reportError(def.storageKey, e))),
    pullSystemTables().catch((e) => reportError('system_tables', e)),
  ]);
}

/** Forget everything private (used on sign-out). Public data is re-pulled. */
export async function resetAndPull() {
  for (const def of COLLECTIONS) localStorage.removeItem(def.storageKey);
  synced.clear();
  await pullAll();
}

async function pushCollection(def: CollectionDef, records: any[]) {
  const previous = synced.get(def.storageKey) ?? new Map<string, string>();
  const next = new Map<string, string>();
  const upserts: Record<string, any>[] = [];

  for (const record of records) {
    const row = toRow(def, record);
    const id = row[def.pkColumn];
    if (id === undefined || id === null || id === '') continue; // not addressable yet
    const serialized = JSON.stringify(row);
    next.set(String(id), serialized);
    if (previous.get(String(id)) !== serialized) upserts.push(row);
  }
  const deletes = [...previous.keys()].filter((id) => !next.has(id));

  if (upserts.length) {
    const { error } = await supabase!.from(def.table).upsert(upserts, { onConflict: def.pkColumn });
    if (error) throw error;
  }
  if (deletes.length) {
    const { error } = await supabase!.from(def.table).delete().in(def.pkColumn, deletes);
    if (error) throw error;
  }
  synced.set(def.storageKey, next);
}

async function pushSystemTable(key: string, rows: unknown) {
  const serialized = JSON.stringify(rows);
  if (synced.get(key)?.get(key) === serialized) return;
  const { error } = await supabase!.from('system_tables').upsert({ key, rows }, { onConflict: 'key' });
  if (error) throw error;
  synced.set(key, new Map([[key, serialized]]));
}

/** Called after the UI saves a collection. Fire-and-forget; failures are reported, local data is kept. */
export function persist(storageKey: string, data: unknown) {
  if (!supabase || !isSyncedKey(storageKey)) return;
  const prev = queues.get(storageKey) ?? Promise.resolve();
  const run = prev.then(async () => {
    const { data: session } = await supabase!.auth.getSession();
    if (!session.session) return; // anonymous visitors cannot write
    try {
      const def = byKey.get(storageKey);
      if (def) await pushCollection(def, Array.isArray(data) ? data : []);
      else await pushSystemTable(storageKey, data);
    } catch (e) {
      reportError(storageKey, e);
    }
  });
  queues.set(storageKey, run);
}
