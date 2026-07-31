// ─── CONNECTED INTELLIGENCE: cross-module causal chains for HOME ─────────────
// Per CEO product-review feedback: signals must not read as isolated data points.
// This layer fuses four REAL, already-existing data sources per account :
// Delivery Health (engagement RAG), Competition (strategic hypotheses tied to
// account_ids), Marketing (whitespace topics), and the Accounts dossier (big
// bets, buying-influence relationship tags): into one cause → pressure →
// opportunity narrative, plus an explicit Why It Matters and a Next Best Action built
// by combining sentences that already exist in those modules (never fabricated).
//
// It does NOT duplicate the research-driven signals/opportunities HeadsUpBand
// already surfaces from research/*.json: this is the OTHER three modules
// (Delivery, Competition, Marketing) plus the Accounts dossier, fused together.

import { ENGAGEMENTS, type Engagement, type RagStatus, SIGNAL_FAMILY_LABEL } from '../data/delivery.seed'
import { STRATEGIC_HYPOTHESES, type StrategicHypothesis } from '../data/competition.seed'
import { TOPICS, type Topic } from '../data/marketing.seed'
import { DOSSIERS, ALL_EXECS, type AccountExec, RELATIONSHIP_META } from '../data/accounts.seed'
import type { EvidenceItem, OrganizationIntelligence } from './orgIntelligence'

const RAG_SEVERITY: Record<RagStatus, number> = { Critical: 3, NeedsAttention: 2, Stable: 1 }
const CONF_WEIGHT: Record<'High' | 'Medium' | 'Low', number> = { High: 3, Medium: 2, Low: 1 }

function worstEngagement(accountId: string): Engagement | null {
  const list = ENGAGEMENTS.filter(e => e.account_id === accountId)
  if (list.length === 0) return null
  return list.slice().sort((a, b) => RAG_SEVERITY[b.rag_status] - RAG_SEVERITY[a.rag_status])[0]
}

function bestHypothesis(accountId: string): StrategicHypothesis | null {
  const list = STRATEGIC_HYPOTHESES.filter(h => h.account_ids.includes(accountId))
  if (list.length === 0) return null
  return list.slice().sort((a, b) => CONF_WEIGHT[b.confidence] - CONF_WEIGHT[a.confidence])[0]
}

function bestWhitespaceTopic(serviceLine: string | undefined): Topic | null {
  const whitespace = TOPICS.filter(t => t.classification === 'Whitespace')
  const sameLine = serviceLine ? whitespace.filter(t => t.service_line === serviceLine): []
  const pool = sameLine.length > 0 ? sameLine: whitespace
  if (pool.length === 0) return null
  return pool.slice().sort((a, b) => (a.indegene_status === 'Gap' ? -1: 0) - (b.indegene_status === 'Gap' ? -1: 0))[0]
}

export interface ChainNode {
  kind: 'Delivery' | 'Competitive' | 'Whitespace'
  badge: string
  headline: string
  detail: string
  evidenceItem: EvidenceItem
}
export interface ConnectedChain {
  accountId: string
  accountName: string
  accentColor: string
  headline: string
  bigBetTitle: string | null
  nodes: ChainNode[]
  soWhat: string
  nextBestAction: string
  confidence: 'High' | 'Medium' | 'Low'
}

export function computeConnectedChains(data: OrganizationIntelligence): ConnectedChain[] {
  const accounts = data.quarters.map(q => ({ id: q.accountId, name: q.accountName, color: q.accentColor }))
  const chains: ConnectedChain[] = []

  for (const acct of accounts) {
    const eng = worstEngagement(acct.id)
    const hyp = bestHypothesis(acct.id)
    const topic = bestWhitespaceTopic(eng?.service_line)
    const bigBet = DOSSIERS.find(d => d.account_id === acct.id)?.big_bets[0] ?? null
    if (!eng && !hyp) continue

    const nodes: ChainNode[] = []

    if (eng) {
      const worstFamily = eng.signals.slice().sort((a, b) => RAG_SEVERITY[b.trend[2]] - RAG_SEVERITY[a.trend[2]])[0]
      nodes.push({
        kind: 'Delivery',
        badge: 'Delivery Health',
        headline: eng.name,
        detail: eng.root_cause,
        evidenceItem: {
          id: `connected:delivery:${eng.id}`, kind: 'signal', accountId: acct.id, accountName: acct.name, accentColor: acct.color,
          title: eng.name, categoryLabel: eng.rag_status === 'Critical' ? 'Critical': eng.rag_status === 'NeedsAttention' ? 'Risk': 'Positive',
          what_happened: eng.root_cause,
          evidence: worstFamily ? `${SIGNAL_FAMILY_LABEL[worstFamily.family]}: ${worstFamily.label}: ${worstFamily.narrative}`: undefined,
          why_it_matters: eng.business_impact_rationale,
          urgency: eng.rag_status === 'Critical' ? 'High': eng.rag_status === 'NeedsAttention' ? 'Medium': 'Low',
          next_best_action: eng.interventions[0]?.title,
          who: eng.interventions[0] ? { name: eng.interventions[0].owner_name, role: 'Recovery owner' }: null,
          sources: [], dateISO: eng.timeline[eng.timeline.length - 1]?.event_date ?? null,
        },
      })
    }

    if (hyp) {
      nodes.push({
        kind: 'Competitive',
        badge: 'Competition',
        headline: hyp.title,
        detail: hyp.hypothesis,
        evidenceItem: {
          id: `connected:competitive:${hyp.id}:${acct.id}`, kind: 'signal', accountId: acct.id, accountName: acct.name, accentColor: acct.color,
          title: hyp.title, categoryLabel: 'Competitive',
          what_happened: hyp.hypothesis,
          so_what: hyp.indegene_angle,
          confidence: hyp.confidence, urgency: hyp.confidence === 'High' ? 'High': 'Medium',
          next_best_action: hyp.next_best_steps[0],
          sources: [], dateISO: null,
        },
      })
    }

    if (topic) {
      nodes.push({
        kind: 'Whitespace',
        badge: topic.indegene_status === 'Gap' ? 'Whitespace: capability gap': 'Whitespace: open door',
        headline: topic.name,
        detail: topic.driven_by.length > 0 ? `Activity currently driven by ${topic.driven_by.join(', ')}.`: 'No competitor currently owns this topic.',
        evidenceItem: {
          id: `connected:whitespace:${topic.id}:${acct.id}`, kind: 'signal', accountId: acct.id, accountName: acct.name, accentColor: acct.color,
          title: topic.name, categoryLabel: 'Growth',
          what_happened: topic.driven_by.length > 0
            ? `Whitespace topic in ${topic.service_line}, currently driven by ${topic.driven_by.join(', ')}. Company status: ${topic.indegene_status === 'Gap' ? 'capability gap': 'active'}.`
           : `Whitespace topic in ${topic.service_line} with no competitor currently active. Company status: ${topic.indegene_status === 'Gap' ? 'capability gap': 'active'}.`,
          factBlock: [{ label: 'Rising activity (last 4 periods)', value: topic.activity_trend.map(t => t.value).join(' → ') }],
          urgency: topic.indegene_status === 'Gap' ? 'Medium': 'Low',
          sources: [], dateISO: null,
        },
      })
    }

    const soWhatParts: string[] = []
    if (eng) soWhatParts.push(`${eng.name} is ${eng.rag_status === 'Critical' ? 'Critical': eng.rag_status === 'NeedsAttention' ? 'trending down': 'stable'}.`)
    if (hyp) soWhatParts.push(hyp.indegene_angle)
    if (topic) soWhatParts.push(topic.indegene_status === 'Gap' ? `Meanwhile "${topic.name}" is a whitespace topic Company does not yet own.`: `Meanwhile "${topic.name}" is open whitespace in the same service line.`)
    const soWhat = soWhatParts.join(' ')

    const nextBestAction = eng?.interventions[0]?.title ?? hyp?.next_best_steps[0] ?? (bigBet ? `Bring the account team into the "${bigBet.title}" conversation.`: 'No immediate action queued: monitor.')

    chains.push({
      accountId: acct.id, accountName: acct.name, accentColor: acct.color,
      headline: eng ? eng.name: hyp!.title,
      bigBetTitle: bigBet?.title ?? null,
      nodes, soWhat, nextBestAction,
      confidence: hyp?.confidence ?? 'Medium',
    })
  }

  return chains
}

// ─── White Space Opportunities: org-wide, from Marketing's real topic grid ───
export interface WhiteSpaceRow {
  id: string; name: string; serviceLine: string
  isGap: boolean; drivenBy: string[]
  trend: { period: string; value: number }[]
  latestValue: number
}
export function computeWhiteSpace(): WhiteSpaceRow[] {
  return TOPICS.filter(t => t.classification === 'Whitespace')
    .map(t => ({
      id: t.id, name: t.name, serviceLine: t.service_line, isGap: t.indegene_status === 'Gap',
      drivenBy: t.driven_by, trend: t.activity_trend, latestValue: t.activity_trend[t.activity_trend.length - 1]?.value ?? 0,
    }))
    .sort((a, b) => (Number(b.isGap) - Number(a.isGap)) || (b.latestValue - a.latestValue))
}

// ─── Buying-influence tag: accounts.seed.ts's real relationship map, merged ──
// onto the research-executive roster by name match. This is the platform's
// relationship/buying-influence intelligence (org-chart with Champion/Warm/
// Cold/WhiteSpace tags) resurfaced onto HOME's executive rail.
export function relationshipForExec(accountId: string, name: string | null): AccountExec['relationship'] | null {
  if (!name) return null
  const norm = name.trim().toLowerCase()
  const match = ALL_EXECS.find(e => e.account_id === accountId && e.name.trim().toLowerCase() === norm)
  return match?.relationship ?? null
}
export { RELATIONSHIP_META }
export function accountExecDetail(accountId: string, name: string | null): AccountExec | null {
  if (!name) return null
  const norm = name.trim().toLowerCase()
  return ALL_EXECS.find(e => e.account_id === accountId && e.name.trim().toLowerCase() === norm) ?? null
}

/** The Company account owner (real, from delivery.seed.ts's account_manager
 *  field: one per account, consistent across every engagement on file). */
export function accountOwner(accountId: string): string | null {
  return ENGAGEMENTS.find(e => e.account_id === accountId)?.account_manager ?? null
}

/** Doc-named export for the primary relationship exec used by Runway 11
 *  Intelligence's "Preferences" panel: highest-priority AccountExec on file. */
export function primaryAccountExec(accountId: string): AccountExec | null {
  const order = { Champion: 3, Warm: 2, Cold: 1, WhiteSpace: 0 } as const
  return ALL_EXECS.filter(e => e.account_id === accountId).sort((a, b) => order[b.relationship] - order[a.relationship])[0] ?? null
}
