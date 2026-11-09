import { persist } from './sync';

/**
 * Save a collection the UI owns. Writes the local working copy synchronously
 * (the UI reads it back synchronously) and, when Supabase is configured,
 * syncs the change to the database in the background.
 */
export function writeCollection(storageKey: string, data: unknown) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${storageKey}:`, e);
  }
  persist(storageKey, data);
}
