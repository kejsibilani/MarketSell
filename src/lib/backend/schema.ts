/**
 * Mapping between the records the UI keeps (camelCase, loosely typed) and the
 * Supabase tables (snake_case, typed columns + an `extra` jsonb catch-all).
 *
 * This module is pure — no Supabase or browser APIs — so it is shared by the
 * runtime sync layer and by `scripts/generate-seed.ts`.
 */

export type ColumnType = 'text' | 'num' | 'bool' | 'json' | 'text[]';

export interface CollectionDef {
  /** Key the UI uses in local storage. */
  storageKey: string;
  /** Supabase table name. */
  table: string;
  /** Primary-key column in the table. */
  pkColumn: string;
  /** Derive the primary key from a UI record. */
  idOf: (record: any) => string | number | undefined;
  /** UI field -> column type. Column name is the snake_case of the field unless renamed. */
  columns: Record<string, ColumnType>;
  /** UI field -> column name, for fields whose snake_case form is unsuitable. */
  rename?: Record<string, string>;
  /** Columns the client reads but never writes (managed by the database). */
  readOnly?: string[];
  /** Fields removed from records when reading (synthetic keys). */
  stripOnRead?: string[];
}

/** One row per key in `system_tables`. The whole list is stored as jsonb. */
export interface BlobDef {
  storageKey: string;
}

const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camel = (s: string) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

/** Columns every table has that are never part of UI records. */
const META_COLUMNS = new Set(['extra', 'inserted_at', 'modified_at']);

export const COLLECTIONS: CollectionDef[] = [
  {
    storageKey: 'marketsell_users',
    table: 'members',
    pkColumn: 'user_id',
    idOf: (r) => r.userId,
    columns: {
      userId: 'num', email: 'text', name: 'text', roles: 'text[]', authUserId: 'text',
      sellerGroup: 'text', buyerGroup: 'text', agentGroup: 'text',
      buyerRating: 'num', sellerRating: 'num', agentRating: 'num',
    },
    readOnly: ['roles', 'auth_user_id'],
  },
  {
    storageKey: 'marketsell_companies',
    table: 'companies',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: {
      id: 'text', name: 'text', country: 'text', city: 'text', contactEmail: 'text',
      status: 'text', companyGroupId: 'text', createdAt: 'text',
    },
  },
  {
    storageKey: 'marketsell_user_rights',
    table: 'user_rights',
    pkColumn: 'id',
    idOf: (r) => (r.userId != null && r.companyId ? `${r.userId}:${r.companyId}:${r.role ?? 'buyer'}` : undefined),
    columns: {
      id: 'text', userId: 'num', companyId: 'text', companyGroupId: 'text', role: 'text',
      canSell: 'bool', canBeAgent: 'bool', canPlaceOrders: 'bool', canUpdateData: 'bool',
      canAuthoriseUsers: 'bool',
    },
    stripOnRead: ['id'],
  },
  {
    storageKey: 'marketsell_producers',
    table: 'producers',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: { id: 'text', name: 'text', country: 'text', status: 'text', contactEmail: 'text', skuCount: 'num' },
  },
  {
    storageKey: 'marketsell_skus',
    table: 'skus',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: {
      id: 'text', sku: 'text', skuName: 'text', eanBarcode: 'text', internalCode: 'text',
      warehouseCode: 'text', product: 'text', productName: 'text', productLine: 'text',
      productCategory: 'text', origin: 'text', producerId: 'text', producerName: 'text',
      companyId: 'text', pack: 'text', status: 'text',
    },
  },
  {
    storageKey: 'marketsell_stock_movements',
    table: 'stock_movements',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: {
      id: 'text', skuId: 'text', date: 'text', type: 'text', quantityUnits: 'num',
      warehouseId: 'text', companyId: 'text', referenceNumber: 'text', linkedToType: 'text',
      linkedToId: 'text', comment: 'text',
    },
  },
  {
    storageKey: 'marketsell_shipments',
    table: 'shipments',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: {
      id: 'text', shipmentId: 'text', date: 'text', from: 'text', to: 'text', carrier: 'text',
      status: 'text', items: 'json', warehouseId: 'text', companyId: 'text', buyerId: 'text',
      buyerEmail: 'text', buyerName: 'text', buyerAccountNumber: 'text', linkedOrderId: 'text',
      linkedOrderType: 'text', relatedMovementId: 'text', documents: 'json', pictures: 'json',
      draftState: 'bool', comment: 'text',
    },
    rename: { from: 'from_location', to: 'to_location' },
  },
  {
    storageKey: 'marketsell_transformations',
    table: 'transformation_orders',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: {
      id: 'text', orderId: 'text', date: 'text', type: 'text', status: 'text', company: 'text',
      companyId: 'text', inputItems: 'json', outputItems: 'json', relatedMovementId: 'text',
      healthMinistryAuthorizationNumber: 'text', draftState: 'bool', comment: 'text',
    },
  },
  {
    storageKey: 'marketsell_restocking_orders',
    table: 'restocking_orders',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: {
      id: 'text', date: 'text', company: 'text', companyId: 'text', product: 'text', sku: 'text',
      qty: 'num', warehouse: 'text', requestedDate: 'text', status: 'text', notes: 'text',
      linkedShipmentIds: 'json', linkedTransformations: 'json', draftState: 'bool',
    },
  },
  {
    storageKey: 'marketsell_sales_orders',
    table: 'sales_orders',
    pkColumn: 'id',
    idOf: (r) => r.id,
    columns: {
      id: 'text', orderId: 'text', date: 'text', buyerName: 'text', buyerEmail: 'text',
      buyerCountry: 'text', buyerDestination: 'text', sellerCompanyId: 'text',
      sellerCompany: 'text', sellerEmail: 'text', agent: 'text', agentCommission: 'num',
      orderSource: 'text', orderSourceValue: 'text', status: 'text', items: 'json',
      totalValue: 'num', currency: 'text', totalItems: 'num', createdDate: 'text',
      dueDate: 'text', linkedShipmentIds: 'json', notes: 'text',
    },
  },
];

export const SYSTEM_TABLES: BlobDef[] = [
  'sys_categories',
  'sys_doc_types',
  'sys_packaging',
  'sys_countries',
  'sys_transformation_types',
  'sys_stock_movement_types',
].map((storageKey) => ({ storageKey }));

export const columnName = (def: CollectionDef, field: string) => def.rename?.[field] ?? snake(field);

const fieldName = (def: CollectionDef, column: string) => {
  for (const [field, col] of Object.entries(def.rename ?? {})) if (col === column) return field;
  return camel(column);
};

/** Returns the value coerced to the column type, or `undefined` if it does not fit. */
function coerce(value: unknown, type: ColumnType): unknown {
  if (value === null || value === undefined) return null;
  switch (type) {
    case 'text':
      return typeof value === 'string' ? value : undefined;
    case 'num':
      return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    case 'bool':
      return typeof value === 'boolean' ? value : undefined;
    case 'json':
      return typeof value === 'object' ? value : undefined;
    case 'text[]':
      return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : undefined;
  }
}

/**
 * UI record -> table row. Every writable column is always present (null when
 * absent) so batched upserts never reset unrelated columns to their defaults.
 * Fields without a column, or whose value doesn't fit the column type, go to `extra`.
 */
export function toRow(def: CollectionDef, record: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  const extra: Record<string, any> = {};
  const readOnly = new Set(def.readOnly ?? []);

  for (const [field, type] of Object.entries(def.columns)) {
    const col = columnName(def, field);
    if (readOnly.has(col)) continue;
    const v = coerce(record[field], type);
    if (v === undefined) {
      row[col] = null;
      extra[field] = record[field];
    } else {
      row[col] = v;
      // Remember explicit nulls so the record reads back identically.
      if (record[field] === null) extra[field] = null;
    }
  }
  for (const [field, value] of Object.entries(record)) {
    if (!(field in def.columns) && value !== undefined) extra[field] = value;
  }

  const id = def.idOf(record);
  if (id !== undefined) row[def.pkColumn] = id;
  row.extra = extra;
  return row;
}

/** Table row -> UI record. */
export function fromRow(def: CollectionDef, row: Record<string, any>): Record<string, any> {
  const record: Record<string, any> = {};
  for (const [col, value] of Object.entries(row)) {
    if (META_COLUMNS.has(col) || value === null) continue;
    record[fieldName(def, col)] = value;
  }
  Object.assign(record, row.extra ?? {});
  for (const f of def.stripOnRead ?? []) delete record[f];
  return record;
}
