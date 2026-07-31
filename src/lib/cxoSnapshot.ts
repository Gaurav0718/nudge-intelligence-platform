// ─── "WHAT SHOULD A CXO IMMEDIATELY SEE?" — CEO feedback doc §5 ────────────────
// Financial Health, Pipeline, Win Rate / Loss % / Conversion %, Revenue
// concentration, Share of wallet, Service line mix, Big bets + progress —
// per account. Every field is either (a) computed from real, already-existing
// seed data (PIPELINE deals, ENGAGEMENTS, quarters, research signals) or (b)
// a clearly-flagged illustrative Company-internal estimate where no such data
// exists anywhere in the codebase (win rate, loss %, share of wallet — these
// are Company's OWN business metrics, not fabricated facts about the client
// company, so a deterministic placeholder is safe per the user's explicit
// go-ahead: "combination of both existing data and synthetic/dummy data").

import { PIPELINE } from '../data/growth.seed'
import { ENGAGEMENTS } from '../data/delivery.seed'
import { DOSSIERS } from '../data/accounts.seed'
import { SERVICE_LINES, type ServiceLineId } from '../data/shared'
import type { OrganizationIntelligence } from './orgIntelligence'

/** Real, working, legitimate domain used to source every illustrative/estimated
 *  figure below — never a fabricated article URL. Per doc: "dummy data, dummy
 *  website links (legit but dummy)." */
export const INDEGENE_INTERNAL_SOURCE = { label: 'Company account intelligence (internal estimate)', url: 'https://www.indegene.com' }

function hashOf(s: string): number { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }

export interface FinancialHealth {
  latestValueLabel: string
  trendDirection: 'up' | 'down' | 'flat'
  trendSummary: string
}
export interface PipelineSnapshot {
  quarters: { quarter: string; acvMillions: number; dealCount: number }[]
  totalAcvMillions: number
}
export interface RateMetrics {
  winRatePct: number; lossPct: number; conversionPct: number
  conversionIsReal: boolean
}
export interface RevenueConcentration {
  headline: string | null
  evidenceId: string | null
}
export interface ShareOfWallet {
  pct: number
  accountRevenueLabel: string
  comparisonSentence: string
}
export interface ServiceLineMixRow { serviceLine: ServiceLineId; label: string; engagementCount: number; pct: number }
export interface BigBetProgress { title: string; body: string; progressLabel: string; inMotion: boolean }

export interface CXOSnapshot {
  accountId: string
  financialHealth: FinancialHealth
  pipeline: PipelineSnapshot
  rates: RateMetrics
  revenueConcentration: RevenueConcentration
  shareOfWallet: ShareOfWallet
  serviceLineMix: ServiceLineMixRow[]
  bigBets: BigBetProgress[]
}

const UPCOMING_QUARTERS = ['Q3 2026', 'Q4 2026', 'Q1 2027']
// Deliberately narrow: "<subject> is ~X% of <...> revenue" (a product/franchise
// concentration claim), not any sentence that merely mentions a percentage near
// the word "revenue" (margin/SG&A/R&D breakdowns read as false positives).
const CONCENTRATION_RE = /\bis\b[^.]{0,40}~?\d{1,3}%\s*of\b[^.]{0,25}revenue/i

export function computeCXOSnapshot(data: OrganizationIntelligence, accountId: string): CXOSnapshot {
  const facet = data.quarters.find(q => q.accountId === accountId)
  const points = facet?.points ?? []
  const last = points[points.length - 1], prior = points[points.length - 2]

  const financialHealth: FinancialHealth = {
    latestValueLabel: last?.valueMillions != null ? `${facet?.currency === 'USD' ? '$' : facet?.currency === 'GBP' ? '£' : '€'}${(last.valueMillions / 1000).toFixed(1)}bn` : 'n/a',
    trendDirection: last?.growthPct == null ? 'flat' : last.growthPct > 0.5 ? 'up' : last.growthPct < -0.5 ? 'down' : 'flat',
    trendSummary: last?.growthPct != null && prior?.growthPct != null
      ? `${last.growthPct >= 0 ? '+' : ''}${last.growthPct}% latest quarter vs ${prior.growthPct >= 0 ? '+' : ''}${prior.growthPct}% prior — ${last.growthPct >= prior.growthPct ? 'accelerating' : 'decelerating'}.`
      : 'Trend not available from sourced quarters.',
  }

  const accountDeals = PIPELINE.filter(d => d.account_id === accountId)
  const pipeline: PipelineSnapshot = {
    quarters: UPCOMING_QUARTERS.map(q => {
      const deals = accountDeals.filter(d => d.close_quarter === q)
      return { quarter: q, acvMillions: deals.reduce((s, d) => s + d.acv, 0) / 1000, dealCount: deals.length }
    }),
    totalAcvMillions: accountDeals.filter(d => UPCOMING_QUARTERS.includes(d.close_quarter)).reduce((s, d) => s + d.acv, 0) / 1000,
  }

  const closedWon = accountDeals.filter(d => d.stage === 'ClosedWon').length
  const conversionPct = accountDeals.length > 0 ? Math.round((closedWon / accountDeals.length) * 100) : 0
  const h = hashOf(accountId)
  const rates: RateMetrics = {
    winRatePct: 38 + (h % 30),
    lossPct: 9 + ((h >> 3) % 16),
    conversionPct,
    conversionIsReal: accountDeals.length > 0,
  }

  let revenueConcentration: RevenueConcentration = { headline: null, evidenceId: null }
  for (const item of Object.values(data.evidenceById)) {
    if (item.accountId !== accountId) continue
    const text = item.what_happened ?? item.title
    if (text && CONCENTRATION_RE.test(text)) { revenueConcentration = { headline: text, evidenceId: item.id }; break }
  }

  const walletPct = +(0.15 + ((h >> 5) % 70) / 100).toFixed(2)
  const shareOfWallet: ShareOfWallet = {
    pct: walletPct,
    accountRevenueLabel: financialHealth.latestValueLabel,
    comparisonSentence: `Our share of wallet remains ~${walletPct}% despite a ${financialHealth.latestValueLabel} account.`,
  }

  const engByLine = new Map<ServiceLineId, number>()
  const acctEngagements = ENGAGEMENTS.filter(e => e.account_id === accountId)
  for (const e of acctEngagements) engByLine.set(e.service_line, (engByLine.get(e.service_line) ?? 0) + 1)
  const totalEng = acctEngagements.length || 1
  const serviceLineMix: ServiceLineMixRow[] = SERVICE_LINES
    .map(sl => ({ serviceLine: sl.id, label: sl.label, engagementCount: engByLine.get(sl.id) ?? 0, pct: Math.round(((engByLine.get(sl.id) ?? 0) / totalEng) * 100) }))
    .filter(r => r.engagementCount > 0)
    .sort((a, b) => b.engagementCount - a.engagementCount)

  const dossier = DOSSIERS.find(d => d.account_id === accountId)
  const bigBets: BigBetProgress[] = (dossier?.big_bets ?? []).map(bet => {
    const keywords = bet.title.toLowerCase().split(/\W+/).filter(w => w.length > 4)
    const matched = acctEngagements.find(e => keywords.some(k => e.name.toLowerCase().includes(k) || e.root_cause.toLowerCase().includes(k)))
    return {
      title: bet.title, body: bet.body,
      inMotion: !!matched,
      progressLabel: matched ? `First engagement already initiated — "${matched.name}" (${matched.rag_status}).` : 'Zero engagement initiated yet — early-stage bet, no active project on file.',
    }
  })

  return { accountId, financialHealth, pipeline, rates, revenueConcentration, shareOfWallet, serviceLineMix, bigBets }
}
