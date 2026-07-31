// ─── DELIVERY MODULE DERIVED DATA ─────────────────────────────────────────────
// Account / family / intervention rollups computed from the Engagement seed +
// the shared initiatives store, matching the reference dashboard computations.

import {
  ENGAGEMENTS, type Engagement, type RecoveryIntervention, type SignalFamily, type Rag,
  ragOf, signalRag,
} from '../../data/delivery.seed'
import { ALL_SIGNAL_FAMILIES } from '../../data/delivery.seed'
import { allInitiatives } from '../../lib/initiatives'
import { accountById } from '../../data/shared'

export type IvStatus = 'awaiting' | 'accepted' | 'completed' | 'rejected'

export interface IvRow {
  iv: RecoveryIntervention
  engagement: Engagement
  status: IvStatus
  updatedAt: string
}

/** Effective intervention status = shared initiatives override, else seed status. */
export function interventionStatus(iv: RecoveryIntervention): IvStatus {
  const tracked = allInitiatives().find(i => i.source_id === iv.id)
  if (tracked) {
    if (tracked.status === 'InProgress') return 'accepted'
    if (tracked.status === 'Complete') return 'completed'
    if (tracked.status === 'NotStarted') return 'rejected'
  }
  if (iv.status === 'Accepted' || iv.status === 'InProgress') return 'accepted'
  if (iv.status === 'Rejected') return 'rejected'
  return 'awaiting'
}

export function allIvRows(): IvRow[] {
  return ENGAGEMENTS.flatMap(e =>
    e.interventions.map(iv => {
      const tracked = allInitiatives().find(i => i.source_id === iv.id)
      return { iv, engagement: e, status: interventionStatus(iv), updatedAt: tracked?.updated_at ?? iv.due_date }
    }))
}

export interface AccountStat { account_id: string; account: string; total: number; red: number; amber: number; green: number; score: number }

export function accountHealthStats(): AccountStat[] {
  const by = new Map<string, AccountStat>()
  for (const e of ENGAGEMENTS) {
    let s = by.get(e.account_id)
    if (!s) { s = { account_id: e.account_id, account: accountById(e.account_id)?.name ?? e.account_id, total: 0, red: 0, amber: 0, green: 0, score: 0 }; by.set(e.account_id, s) }
    s.total++
    const r = ragOf(e.rag_status)
    if (r === 'red') s.red++; else if (r === 'amber') s.amber++; else s.green++
  }
  return Array.from(by.values()).map(s => ({ ...s, score: Math.round(((s.green + s.amber * 0.5) / s.total) * 100) }))
}

const FAMILY_DRIVER: Record<SignalFamily, string> = {
  DeliveryPerformance: 'SLA misses and first-time-right drops are driving execution pressure',
  RiskCompliance: 'audit findings and unresolved escalations are elevating regulatory exposure',
  CustomerSentiment: 'negative sentiment in QBR/MBR reviews signals emerging misalignment',
  OperationsData: 'effort overruns and backlog growth are straining delivery capacity',
  PeopleData: 'capacity gaps and adoption stalls are bottlenecking critical roles',
}

export interface FamilyStat { family: SignalFamily; total: number; critical: number; attention: number; stable: number; narrative: string }

export function familyHealthData(): FamilyStat[] {
  return ALL_SIGNAL_FAMILIES.map(family => {
    const relevant = ENGAGEMENTS.filter(e => e.signals.some(s => s.family === family))
    const worstOf = (e: Engagement): Rag => {
      const statuses = e.signals.filter(s => s.family === family).map(s => signalRag(s.trend))
      if (statuses.includes('red')) return 'red'
      if (statuses.includes('amber')) return 'amber'
      return 'green'
    }
    const critical = relevant.filter(e => worstOf(e) === 'red')
    const attention = relevant.filter(e => worstOf(e) === 'amber')
    const stable = relevant.length - critical.length - attention.length
    const atRisk = [...critical, ...attention]
    const slCounts: Record<string, number> = {}
    atRisk.forEach(e => { slCounts[e.service_line] = (slCounts[e.service_line] ?? 0) + 1 })
    const topSl = Object.entries(slCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([sl]) => sl)
    const narrative = atRisk.length
      ? `${atRisk.length} project${atRisk.length === 1 ? '' : 's'} show elevated risk in this family. ${FAMILY_DRIVER[family]}${topSl.length ? `, concentrated in ${topSl.join(' and ')}` : ''}.`
      : 'No critical or at-risk signals in this family right now.'
    return { family, total: relevant.length, critical: critical.length, attention: attention.length, stable, narrative }
  })
}

/** Matrix cell count: projects in (serviceLine × family) with a signal of `health`. */
export function matrixMatch(e: Engagement, family: SignalFamily, health: Rag | 'all'): boolean {
  const fam = e.signals.filter(s => s.family === family)
  if (!fam.length) return false
  if (health === 'all') return fam.some(s => { const r = signalRag(s.trend); return r === 'red' || r === 'amber' })
  return fam.some(s => signalRag(s.trend) === health)
}
