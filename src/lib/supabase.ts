// ─── SUPABASE CLIENT + GENERIC CRUD + LOCALSTORAGE FALLBACK ───────────────────
// Platform-wide dual-layer persistence (master §3): localStorage is always-on;
// Supabase read-through / write-through kicks in only when env vars are present.

import { sync, SYNC_ENABLED, mirror } from './dbSync'

// Back-compat exports (some modules import these names).
export const supabase = sync
export const isSupabaseEnabled = SYNC_ENABLED

const LS_PREFIX = 'nudge:'

function lsRead<T>(table: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(LS_PREFIX + table) || '[]')
  } catch {
    return []
  }
}
function lsWrite<T>(table: string, rows: T[]) {
  try {
    localStorage.setItem(LS_PREFIX + table, JSON.stringify(rows))
    mirror(LS_PREFIX + table, rows)   // write-through to Supabase (no-op if disabled)
  } catch {
    /* quota / private mode — ignore for demo */
  }
}

/** Seed a table's localStorage cache exactly once (first run). */
export function ensureSeed<T extends { id: string }>(table: string, seed: T[]): T[] {
  const existing = lsRead<T>(table)
  if (existing.length === 0 && seed.length > 0) {
    lsWrite(table, seed)
    return seed
  }
  return existing
}

// Reads come from localStorage, which is hydrated from Supabase on boot (dbSync).
export async function dbAll<T extends { id: string }>(table: string, seed: T[] = []): Promise<T[]> {
  return ensureSeed<T>(table, seed)
}

export async function dbUpsert<T extends { id: string }>(table: string, row: T): Promise<T> {
  const rows = lsRead<T>(table)
  const idx = rows.findIndex(r => r.id === row.id)
  if (idx >= 0) rows[idx] = row
  else rows.push(row)
  lsWrite(table, rows)   // mirrors to Supabase
  return row
}

export async function dbDelete(table: string, id: string): Promise<void> {
  const rows = lsRead<{ id: string }>(table)
  lsWrite(table, rows.filter(r => r.id !== id))   // mirrors to Supabase
}

export function dbAllLocal<T extends { id: string }>(table: string, seed: T[] = []): T[] {
  return ensureSeed<T>(table, seed)
}
