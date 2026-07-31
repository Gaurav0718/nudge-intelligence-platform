// ─── SHARED INITIATIVES (master §1.4 / §7) ────────────────────────────────────
// One initiatives + checklist_items store shared across Competition, Delivery Health,
// Marketing and Growth, scoped by `module` + `source_type`. Persisted via localStorage.

import { dbAllLocal, dbUpsert, dbDelete } from './supabase'

export type InitiativeModule = 'Competition' | 'DeliveryHealth' | 'MarketingServiceLine' | 'Growth' | 'Organization'
export type InitiativeStatus = 'NotStarted' | 'InProgress' | 'Complete'

export interface Initiative {
  id: string
  title: string
  status: InitiativeStatus
  description?: string
  execution_guidance?: string
  module: InitiativeModule
  source_type?: string
  source_id?: string
  primary_owner_name?: string
  start_date?: string
  target_completion_date?: string
  service_line?: string | null
  account_id?: string | null
  progress_pct?: number
  updates?: InitiativeUpdate[]
  created_at: string
  updated_at: string
}

export interface InitiativeUpdate {
  ts: string
  text: string
  progress_pct?: number
}

export interface ChecklistItem {
  id: string
  initiative_id: string
  text: string
  is_complete: boolean
  order_index: number
}

const TABLE = 'initiatives'
const CL_TABLE = 'checklist_items'

export function allInitiatives(): Initiative[] {
  return dbAllLocal<Initiative>(TABLE, [])
}
export function initiativesForModule(m: InitiativeModule): Initiative[] {
  return allInitiatives().filter(i => i.module === m)
}
export function upsertInitiative(i: Initiative) {
  return dbUpsert(TABLE, { ...i, updated_at: new Date().toISOString() })
}
export function deleteInitiative(id: string) {
  checklistFor(id).forEach(c => dbDelete(CL_TABLE, c.id))
  return dbDelete(TABLE, id)
}

export function createInitiative(partial: Omit<Initiative, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Initiative {
  const now = new Date().toISOString()
  const init: Initiative = {
    id: partial.id ?? 'init-' + Math.random().toString(36).slice(2, 10),
    created_at: now, updated_at: now,
    ...partial,
  }
  dbUpsert(TABLE, init)
  return init
}

/** Idempotent promotion: if an initiative already exists for this source, return it. */
export function promoteToInitiative(
  source_id: string,
  data: Omit<Initiative, 'id' | 'created_at' | 'updated_at' | 'source_id'>,
): Initiative {
  const existing = allInitiatives().find(i => i.source_id === source_id)
  if (existing) return existing
  return createInitiative({ ...data, source_id })
}

/** Clamp + persist a progress percentage on a promoted initiative. */
export function setInitiativeProgress(init: Initiative, pct: number): Initiative {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)))
  const status: InitiativeStatus = clamped >= 100 ? 'Complete' : clamped > 0 ? 'InProgress' : 'NotStarted'
  const next = { ...init, progress_pct: clamped, status, updated_at: new Date().toISOString() }
  dbUpsert(TABLE, next)
  return next
}

/** Append a free-text progress update (optionally moving the progress %). */
export function addInitiativeUpdate(init: Initiative, text: string, pct?: number): Initiative {
  const update: InitiativeUpdate = { ts: new Date().toISOString(), text, progress_pct: pct }
  const clamped = pct == null ? init.progress_pct : Math.max(0, Math.min(100, Math.round(pct)))
  const status: InitiativeStatus = (clamped ?? 0) >= 100 ? 'Complete' : (clamped ?? 0) > 0 ? 'InProgress' : init.status
  const next: Initiative = {
    ...init, progress_pct: clamped, status,
    updates: [...(init.updates ?? []), update], updated_at: new Date().toISOString(),
  }
  dbUpsert(TABLE, next)
  return next
}

export function checklistFor(initiativeId: string): ChecklistItem[] {
  return dbAllLocal<ChecklistItem>(CL_TABLE, [])
    .filter(c => c.initiative_id === initiativeId)
    .sort((a, b) => a.order_index - b.order_index)
}
export function addChecklistItem(initiativeId: string, text: string): ChecklistItem {
  const items = checklistFor(initiativeId)
  const item: ChecklistItem = {
    id: 'cl-' + Math.random().toString(36).slice(2, 10),
    initiative_id: initiativeId, text, is_complete: false, order_index: items.length,
  }
  dbUpsert(CL_TABLE, item)
  return item
}
export function toggleChecklistItem(item: ChecklistItem) {
  dbUpsert(CL_TABLE, { ...item, is_complete: !item.is_complete })
}
export function removeChecklistItem(id: string) {
  dbDelete(CL_TABLE, id)
}
