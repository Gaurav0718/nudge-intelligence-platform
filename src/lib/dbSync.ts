// ─── SINGLE-TABLE SUPABASE MIRROR ─────────────────────────────────────────────
// Every feature persists to localStorage under a string key. This mirrors each key
// 1:1 into a single Supabase table `app_state(store text pk, data jsonb, updated_at)`.
// No per-feature schema, no uuid/text-id mismatch — whatever the app saves is synced.
//
//   • hydrateAll()  — pull all rows into localStorage on boot (read-through)
//   • mirror(k,v)   — push one key to Supabase on every write (write-through)
//
// When VITE_SUPABASE_URL / _ANON_KEY are absent, both are no-ops and the app runs
// on localStorage alone.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const sync: SupabaseClient | null = url && anon ? createClient(url, anon) : null
export const SYNC_ENABLED = !!sync

const TABLE = 'app_state'

/** Write-through: upsert one localStorage key → app_state. Fire-and-forget. */
export function mirror(key: string, value: unknown): void {
  if (!sync) return
  void sync.from(TABLE).upsert({ store: key, data: value, updated_at: new Date().toISOString() }, { onConflict: 'store' })
    .then(undefined, () => { /* offline / RLS — localStorage already holds the truth */ })
}

/** Read-through: pull every row into localStorage before the app renders. */
export async function hydrateAll(): Promise<void> {
  if (!sync) return
  try {
    const { data, error } = await sync.from(TABLE).select('store, data')
    if (error || !data) return
    for (const row of data) {
      try { localStorage.setItem(row.store, JSON.stringify(row.data)) } catch { /* quota */ }
    }
  } catch { /* network — fall back to whatever localStorage has */ }
}
