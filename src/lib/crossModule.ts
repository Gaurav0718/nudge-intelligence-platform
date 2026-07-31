// ─── CROSS-MODULE SIGNAL AGGREGATION (master §2.2 / §8) ───────────────────────
// Rolls up per-account signals from Delivery Health, Competition and Marketing.

import { engagementsForAccount, type RagStatus } from '../data/delivery.seed'
import { metricsForAccount } from '../data/marketing.seed'
import { SIGNALS, COMPETITORS } from '../data/competition.seed'

export interface CrossModuleSignals {
  deliveryRag: RagStatus
  deliveryCounts: Record<RagStatus, number>
  openCompetitionSignals: number
  shareOfVoice: number | null
  topServiceLine: string | null
}

const rank: Record<RagStatus, number> = { Stable: 0, NeedsAttention: 1, Critical: 2 }

export function crossModuleFor(accountId: string): CrossModuleSignals {
  const engs = engagementsForAccount(accountId)
  const counts: Record<RagStatus, number> = { Critical: 0, NeedsAttention: 0, Stable: 0 }
  engs.forEach(e => counts[e.rag_status]++)
  const deliveryRag = engs.reduce<RagStatus>((worst, e) => (rank[e.rag_status] > rank[worst] ? e.rag_status : worst), 'Stable')

  const cutoff = '2026-05-01'
  const openCompetitionSignals = SIGNALS.filter(s => s.signal_date >= cutoff).length

  const metrics = metricsForAccount(accountId)
  const top = metrics.sort((a, b) => b.share_of_voice_pct - a.share_of_voice_pct)[0]

  return {
    deliveryRag, deliveryCounts: counts,
    openCompetitionSignals,
    shareOfVoice: top ? top.share_of_voice_pct : null,
    topServiceLine: top ? top.service_line : null,
  }
}

export const trackedCompetitorCount = COMPETITORS.length
