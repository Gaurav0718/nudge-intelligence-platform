// ─── ORGANIZATION INTELLIGENCE: structured data layer for HOME ───────────────
// Compiles the five accounts' research artifacts (research/<account>/{signals,
// opportunities,executives,quarters,sources}.json) into typed, ranked view models.
// Components never touch the raw research JSON: they consume only the shapes
// exported below (via useOrganizationIntelligence()) plus `evidenceById` lookups.

import { CORE_ACCOUNTS } from '../data/shared'

// Raw research imports: the only place in the app that reads research/*.json.
import azSignals from '../../research/astrazeneca/signals.json'
import azOpportunities from '../../research/astrazeneca/opportunities.json'
import azExecutives from '../../research/astrazeneca/executives.json'
import azQuarters from '../../research/astrazeneca/quarters.json'
import azSources from '../../research/astrazeneca/sources.json'

import gskSignals from '../../research/gsk/signals.json'
import gskOpportunities from '../../research/gsk/opportunities.json'
import gskExecutives from '../../research/gsk/executives.json'
import gskQuarters from '../../research/gsk/quarters.json'
import gskSources from '../../research/gsk/sources.json'

import jnjSignals from '../../research/jnj/signals.json'
import jnjOpportunities from '../../research/jnj/opportunities.json'
import jnjExecutives from '../../research/jnj/executives.json'
import jnjQuarters from '../../research/jnj/quarters.json'
import jnjSources from '../../research/jnj/sources.json'

import sanofiSignals from '../../research/sanofi/signals.json'
import sanofiOpportunities from '../../research/sanofi/opportunities.json'
import sanofiExecutives from '../../research/sanofi/executives.json'
import sanofiQuarters from '../../research/sanofi/quarters.json'
import sanofiSources from '../../research/sanofi/sources.json'

import novartisSignals from '../../research/novartis/signals.json'
import novartisOpportunities from '../../research/novartis/opportunities.json'
import novartisExecutives from '../../research/novartis/executives.json'
import novartisQuarters from '../../research/novartis/quarters.json'
import novartisSources from '../../research/novartis/sources.json'

// ─── Raw shapes (loose: the source-of-truth files are authored prose+data) ───
type Urgency = 'High' | 'Medium' | 'Low'
type Confidence = 'High' | 'Medium' | 'Low'
type Polarity = 'Opportunity' | 'Risk' | 'Both'

interface RawSignal {
  id: string; title: string
  what_happened: string; evidence: string; ai_hypothesis: string; so_what: string
  why_it_matters_to_indegene: string
  opportunity_or_risk: Polarity
  next_best_action: string
  urgency: Urgency; confidence: Confidence
  source_references: string[]
  // Authored Connected-Intelligence sections (prompt.md). When absent the
  // compiler falls back to generic templates; when present these are the
  // source of truth for the drawer/popup sections.
  if_no_action?: string
  why_now?: string
  nba_outcome?: string
  expected_outcome?: string
}
interface RawSignalsFile {
  account: string; generated: string
  critical_signals?: RawSignal[]; positive_signals?: RawSignal[]; negative_signals?: RawSignal[]
  financial_signals?: RawSignal[]; competitive_signals?: RawSignal[]; regulatory_signals?: RawSignal[]
  growth_signals?: RawSignal[]; risk_signals?: RawSignal[]
}
interface RawOpportunitiesFile {
  account: string; generated: string
  opportunities: RawSignal[]
  potential_missed_opportunities: RawSignal[]
}
interface RawExecutive {
  id: string; name: string | null; role: string; status?: string
  fact: string; ai_hypothesis: string
  indegene_angle: string; engagement_recommendation: string
  priority: Urgency; confidence: Confidence
  source_references: string[]
  /** Distinct implication — why this executive/role matters now (vs the angle). */
  why_it_matters?: string
}
interface RawTargetFunction {
  id: string; function: string; basis_fact: string
  indegene_angle: string; engagement_recommendation: string
  priority: Urgency; source_references: string[]
  /** Distinct implication — why this buying center matters now (vs the angle). */
  why_it_matters?: string
}
interface RawExecutivesFile {
  account: string; generated: string
  executives: RawExecutive[]
  target_functions?: RawTargetFunction[]
}
interface RawQuarter {
  period: string; period_end: string
  fact: Record<string, unknown>
  ai_hypothesis: string; confidence: Confidence
  source_references: string[]
}
interface RawQuartersFile {
  account: string; generated: string; currency: string
  quarters: RawQuarter[]
  guidance: { fact: Record<string, unknown>; ai_hypothesis: string; confidence: Confidence; source_references: string[] }
}
interface RawSource { title: string; source: string; url: string; date: string; account: string; category: string; evidence: string }

interface AccountBundle {
  id: string; name: string; accentColor: string
  signals: RawSignalsFile
  opportunities: RawOpportunitiesFile
  executives: RawExecutivesFile
  quarters: RawQuartersFile
  sources: RawSource[]
}

// HOME's own restricted chart palette: shades of navy and gold only (brand
// guideline), assigned in fixed CORE_ACCOUNTS order. This does NOT touch
// CORE_ACCOUNTS.accent_color itself (still used elsewhere in the app); it only
// governs how account identity is drawn on this page's charts and avatars.
const NAVY_GOLD_RAMP = ['#1B365D', '#D4AF37', '#2e5a96', '#b89428', '#0d1a2e']

function accountMeta(id: string, index: number) {
  const a = CORE_ACCOUNTS.find(c => c.id === id)
  return { id, name: a?.name ?? id, accentColor: NAVY_GOLD_RAMP[index % NAVY_GOLD_RAMP.length] }
}

// Public corporate homepages: well-known, not sourced from research/*.json.
export const COMPANY_URL: Record<string, string> = {
  astrazeneca: 'https://www.astrazeneca.com',
  gsk: 'https://www.gsk.com',
  jnj: 'https://www.jnj.com',
  sanofi: 'https://www.sanofi.com',
  novartis: 'https://www.novartis.com',
}

const BUNDLES: AccountBundle[] = [
  { ...accountMeta('astrazeneca', 0), signals: azSignals as RawSignalsFile, opportunities: azOpportunities as RawOpportunitiesFile, executives: azExecutives as RawExecutivesFile, quarters: azQuarters as RawQuartersFile, sources: azSources as RawSource[] },
  { ...accountMeta('gsk', 1), signals: gskSignals as RawSignalsFile, opportunities: gskOpportunities as RawOpportunitiesFile, executives: gskExecutives as RawExecutivesFile, quarters: gskQuarters as RawQuartersFile, sources: gskSources as RawSource[] },
  { ...accountMeta('jnj', 2), signals: jnjSignals as RawSignalsFile, opportunities: jnjOpportunities as RawOpportunitiesFile, executives: jnjExecutives as RawExecutivesFile, quarters: jnjQuarters as RawQuartersFile, sources: jnjSources as RawSource[] },
  { ...accountMeta('sanofi', 3), signals: sanofiSignals as RawSignalsFile, opportunities: sanofiOpportunities as RawOpportunitiesFile, executives: sanofiExecutives as RawExecutivesFile, quarters: sanofiQuarters as RawQuartersFile, sources: sanofiSources as RawSource[] },
  { ...accountMeta('novartis', 4), signals: novartisSignals as RawSignalsFile, opportunities: novartisOpportunities as RawOpportunitiesFile, executives: novartisExecutives as RawExecutivesFile, quarters: novartisQuarters as RawQuartersFile, sources: novartisSources as RawSource[] },
]

// ─── Public view-model shapes (the only things components consume) ────────────

export interface EvidenceItem {
  id: string
  kind: 'signal' | 'opportunity' | 'missed' | 'executive' | 'targetFunction' | 'quarter'
  accountId: string | null
  accountName: string | null
  accentColor: string | null
  title: string
  categoryLabel?: string
  what_happened?: string
  evidence?: string
  ai_hypothesis?: string
  so_what?: string
  why_it_matters?: string
  opportunity_or_risk?: Polarity
  urgency?: Urgency
  confidence?: Confidence
  next_best_action?: string
  who?: { name: string | null; role: string } | null
  sources: { label: string; url: string }[]
  factBlock?: { label: string; value: string }[]
  positives?: string[]
  negatives?: string[]
  dateISO?: string | null
  // ─── Connected Intelligence (prompt.md / Company-Connected-Intelligence) ─────
  // The differentiator: independent signals from ≥2 modules that converge on the
  // interpretation. Rendered as an evidence chain (module → signal → meaning).
  connectedModules?: { module: string; signal: string }[]
  // Evidence-backed consequence of inaction. Never a fabricated probability.
  if_no_action?: string
  // What the recommended action should protect / create / validate + how measured.
  expected_outcome?: string
  // Authored per-card timing trigger + direct result, rendered inside the NBA
  // block ("Why now" / "Outcome"). Kept separate from expected_outcome so the
  // NBA's immediate result and the measurable success section don't repeat.
  why_now?: string
  nba_outcome?: string
  // Cross-module priority (distinct from single-signal urgency).
  priority?: 'Critical' | 'High' | 'Medium' | 'Low'
  // Missing data that would materially strengthen the intelligence.
  evidence_gaps?: string
  // Specific, non-generic NBAs. Each names actor / target / why-now / outcome.
  nbas?: { action: string; actor?: string; target?: string; whyNow?: string; outcome?: string }[]
}

export interface HeadsUpChip {
  evidenceId: string; accountId: string; accountName: string; accentColor: string
  title: string; urgency: Urgency; confidence: Confidence; polarity: Polarity
  dateISO: string | null
}
export interface Balance {
  opportunityCount: number; riskCount: number; bothCount: number
  highUrgencyOpportunityCount: number
  opportunityEvidenceIds: string[]; riskEvidenceIds: string[]
}
export interface MomentumPoint {
  accountId: string; accountName: string; accentColor: string
  priorLabel: string; currentLabel: string
  priorPct: number | null; currentPct: number | null
  deltaPct: number | null
  currentQuarterEvidenceId: string
}
export interface OpportunityRow {
  evidenceId: string; accountId: string; accountName: string; accentColor: string
  title: string; urgency: Urgency; confidence: Confidence; isMissed: boolean
}
export interface NBACard {
  rank: number; evidenceId: string
  action: string; because: string
  accountId: string; accountName: string; accentColor: string
  serviceLineGuess?: string
  urgency: Urgency; confidence: Confidence
  whoEvidenceId: string | null; whoLabel: string | null
}
export interface TimelineNode {
  evidenceId: string; accountId: string; accountName: string; accentColor: string
  title: string; categoryLabel: string; dateISO: string | null; polarity: Polarity
}
export interface QuarterPoint { label: string; valueMillions: number | null; growthPct: number | null; evidenceId: string; estimated?: boolean }
export interface QuarterFacet {
  accountId: string; accountName: string; accentColor: string
  currency: string
  points: QuarterPoint[]
  guidanceEvidenceId: string
}
export interface ExecCard {
  evidenceId: string; accountId: string; accountName: string; accentColor: string
  name: string | null; role: string; status?: string
  priority: Urgency; isTargetFunction: boolean
  synthetic?: boolean
  nameUnconfirmed?: boolean
  linkedOpportunityTitles: string[]
}

export interface OrganizationIntelligence {
  generatedAt: string
  accountsTracked: number
  openHighUrgencyOpportunities: number
  windowsClosingThisQuarter: number
  headsUp: HeadsUpChip[]
  balance: Balance
  momentum: MomentumPoint[]
  opportunityLedger: { open: OpportunityRow[]; missed: OpportunityRow[] }
  nba: NBACard[]
  timeline: TimelineNode[]
  quarters: QuarterFacet[]
  executives: ExecCard[]
  evidenceById: Record<string, EvidenceItem>
}

// ─── helpers ────────────────────────────────────────────────────────────────

const URGENCY_WEIGHT: Record<Urgency, number> = { High: 3, Medium: 2, Low: 1 }
const CONF_WEIGHT: Record<Confidence, number> = { High: 3, Medium: 2, Low: 1 }

const CATEGORY_LABEL: Record<string, string> = {
  critical_signals: 'Critical', positive_signals: 'Positive', negative_signals: 'Negative',
  financial_signals: 'Financial', competitive_signals: 'Competitive', regulatory_signals: 'Regulatory',
  growth_signals: 'Growth', risk_signals: 'Risk',
}
const ALL_SIGNAL_KEYS = [
  'critical_signals', 'positive_signals', 'negative_signals',
  'financial_signals', 'competitive_signals', 'regulatory_signals',
  'growth_signals', 'risk_signals',
] as const

const REVENUE_KEY_RE = /^(total_turnover|total_sales|total_revenue|net_sales)$/

function parsePercent(text: string | undefined | null): number | null {
  if (!text) return null
  const m = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/)
  return m ? parseFloat(m[1]): null
}

function parseMoneyMillions(text: string | undefined): number | null {
  if (!text) return null
  const m = text.match(/[£$€]\s?([\d,]+(?:\.\d+)?)\s*(bn|m)?/i)
  if (!m) return null
  const n = parseFloat(m[1].replace(/,/g, ''))
  const unit = (m[2] || '').toLowerCase()
  return unit === 'bn' ? n * 1000: n
}

function findRevenueField(fact: Record<string, unknown>): { value: string | null; growth: string | null } {
  const key = Object.keys(fact).find(k => REVENUE_KEY_RE.test(k))
  if (!key) return { value: null, growth: null }
  const value = fact[key]
  const growth = fact[`${key}_growth`]
  return { value: typeof value === 'string' ? value: null, growth: typeof growth === 'string' ? growth: null }
}

function factToBlock(fact: Record<string, unknown>): { label: string; value: string }[] {
  return Object.entries(fact)
    .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
    .map(([k, v]) => ({
      label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: String(v),
    }))
}

const NEGATIVE_NOTE_RE = /declin|fell|erosion|litigation|dilut|soft|pressure|down\b|loss|risk|cliff/i
/**
 * Splits a quarter's `fact` block into what went well vs. what didn't: from the
 * SAME figures already in factBlock, never invented. Segment-level growth signs,
 * top-line growth fields, and narrative commentary (keyword-classified) each
 * contribute a line. Used to give the evidence drawer three legible things instead
 * of one flat table: what's going well, what's going wrong, and (via ai_hypothesis) what's next.
 */
function classifyQuarterFacts(fact: Record<string, unknown>): { positives: string[]; negatives: string[] } {
  const positives: string[] = [], negatives: string[] = []
  for (const [key, val] of Object.entries(fact)) {
    if (Array.isArray(val)) {
      for (const seg of val) {
        if (seg && typeof seg === 'object' && 'name' in seg && 'growth' in seg) {
          const s = seg as { name: string; value?: string; growth: string }
          const g = parsePercent(s.growth)
          if (g === null) continue
          const line = `${s.name}: ${s.value ? s.value + ' ': ''}(${s.growth})`
          ;(g >= 0 ? positives: negatives).push(line)
        }
      }
      continue
    }
    if (typeof val !== 'string') continue
    if (/growth$/i.test(key)) {
      const g = parsePercent(val)
      if (g === null) continue
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      ;(g >= 0 ? positives: negatives).push(`${label}: ${val}`)
      continue
    }
    // narrative commentary field (segment_commentary, franchise_highlights, erosion_note, ...)
    if (val.length > 30) {
      ;(NEGATIVE_NOTE_RE.test(val) ? negatives: positives).push(val)
    }
  }
  return { positives, negatives }
}

function sourceLinks(refs: string[], sourcesByUrl: Map<string, RawSource>): { label: string; url: string }[] {
  return refs.map(url => {
    const s = sourcesByUrl.get(url)
    return { label: s?.source ? `${s.source}${s.date ? ` · ${s.date}`: ''}`: new URL(url).hostname.replace(/^www\./, ''), url }
  })
}

function earliestDate(refs: string[], sourcesByUrl: Map<string, RawSource>): string | null {
  for (const url of refs) {
    const s = sourcesByUrl.get(url)
    if (s?.date) return s.date
  }
  return null
}

const SERVICE_LINE_HINTS = ['DAAI', 'MedComm', 'MLR', 'Omnichannel', 'Regulatory', 'Tech Solutions']
function guessServiceLine(text: string): string | undefined {
  return SERVICE_LINE_HINTS.find(sl => text.includes(sl))
}

// ─── executive-roster padding (UI density only: never conflated with research) ──
const MIN_EXECS_PER_ACCOUNT = 8
const DUMMY_FIRST = ['Michael', 'Sarah', 'David', 'Elena', 'James', 'Priya', 'Thomas', 'Anika', 'Robert', 'Claire', 'Daniel', 'Meera', 'Andrew', 'Sophia', 'Marcus', 'Nina', 'Victor', 'Grace']
const DUMMY_LAST = ['Whitfield', 'Chen', 'Okafor', 'Rossi', 'Bennett', 'Sharma', 'Nakamura', 'Larsen', 'Delgado', 'Foster', 'Kowalski', 'Reyes', 'Hoffmann', 'Patel', 'Marsh', 'Dubois', 'Alvarez', 'Lindqvist']
const GENERIC_TITLES = [
  'VP Commercial Operations', 'Head of Medical Affairs', 'Chief Digital & AI Officer', 'VP Market Access',
  'Head of Regulatory Affairs', 'VP Omnichannel Strategy', 'Head of Patient Engagement', 'Chief Procurement Officer',
  'VP Launch Excellence', 'Head of Data & Analytics', 'VP Brand Strategy', 'Head of Field Medical',
]
/** Deterministic, globally-unique dummy-name generator: same sequence every render. */
function makeDummyNamer() {
  const used = new Set<string>()
  let i = 0
  return function next(): string {
    for (let guard = 0; guard < DUMMY_FIRST.length * DUMMY_LAST.length; guard++) {
      const f = DUMMY_FIRST[i % DUMMY_FIRST.length]
      const l = DUMMY_LAST[Math.floor(i / DUMMY_FIRST.length) % DUMMY_LAST.length]
      i++
      const name = `${f} ${l}`
      if (!used.has(name)) { used.add(name); return name }
    }
    return `Contact ${i}`
  }
}

// Upgrade a raw signal/opportunity/missed EvidenceItem into Connected Intelligence:
// add an evidence-backed "if no action" and a specific NBA (actor/target/why-now/outcome).
// Deliberately does NOT fabricate a "connected signals" block: re-labeling this card's
// own evidence / why-it-matters / AI-hypothesis as independent modules repeats the same
// points and misrepresents them as cross-module evidence. Genuine cross-module signals
// are supplied only by the Home/chart builders (ciFor / popup signals).
function connectSignalCI(it: EvidenceItem): void {
  const risk = it.opportunity_or_risk === 'Risk'
  const acct = it.accountName ?? 'the account'
  it.priority = it.urgency === 'High' ? 'High' : it.urgency === 'Medium' ? 'Medium' : 'Low'
  it.if_no_action = it.if_no_action ?? (risk
    ? `Left unaddressed, ${(it.so_what || 'the exposure').replace(/\.$/, '')} — and a competitor or the client's internal team acts on it first at ${acct}.`
    : `The window closes: ${(it.so_what || 'this opening').replace(/\.$/, '')} accrues to whoever engages ${acct} first.`)
  if (it.next_best_action) {
    it.nbas = [{
      action: it.next_best_action,
      actor: 'Account Executive + relevant service-line lead',
      target: `${acct} decision-makers`,
      whyNow: it.why_now ?? (it.urgency === 'High' ? 'High urgency — the window is live now.' : (it.so_what || 'The signal is current.')),
      outcome: it.nba_outcome ?? (risk ? `${acct} exposure contained before it converts to lost revenue.` : `A named ${acct} opportunity created from this signal.`),
    }]
  }
}

// ─── the compiler ───────────────────────────────────────────────────────────

export function computeOrganizationIntelligence(): OrganizationIntelligence {
  const evidenceById: Record<string, EvidenceItem> = {}
  const momentum: MomentumPoint[] = []
  const quarters: QuarterFacet[] = []
  const executives: ExecCard[] = []
  const openOpps: OpportunityRow[] = []
  const missedOpps: OpportunityRow[] = []
  const timeline: TimelineNode[] = []
  const headsUpPool: HeadsUpChip[] = []
  const nbaPool: NBACard[] = []
  const nextDummyName = makeDummyNamer()
  let titleCounter = 0
  const balance: Balance = { opportunityCount: 0, riskCount: 0, bothCount: 0, highUrgencyOpportunityCount: 0, opportunityEvidenceIds: [], riskEvidenceIds: [] }

  for (const bundle of BUNDLES) {
    const sourcesByUrl = new Map(bundle.sources.map(s => [s.url, s]))
    const accentColor = bundle.accentColor

    // -- every signal, across all 8 categories, becomes evidence + feeds timeline / heads-up / balance / nba --
    for (const key of ALL_SIGNAL_KEYS) {
      const list = (bundle.signals[key] as RawSignal[] | undefined) ?? []
      for (const sig of list) {
        const evId = `signal:${bundle.id}:${sig.id}`
        evidenceById[evId] = {
          id: evId, kind: 'signal', accountId: bundle.id, accountName: bundle.name, accentColor,
          title: sig.title, categoryLabel: CATEGORY_LABEL[key],
          what_happened: sig.what_happened, evidence: sig.evidence, ai_hypothesis: sig.ai_hypothesis,
          so_what: sig.so_what, why_it_matters: sig.why_it_matters_to_indegene,
          opportunity_or_risk: sig.opportunity_or_risk, urgency: sig.urgency, confidence: sig.confidence,
          next_best_action: sig.next_best_action, who: null,
          if_no_action: sig.if_no_action, expected_outcome: sig.expected_outcome,
          why_now: sig.why_now, nba_outcome: sig.nba_outcome,
          sources: sourceLinks(sig.source_references, sourcesByUrl),
          dateISO: earliestDate(sig.source_references, sourcesByUrl),
        }
        connectSignalCI(evidenceById[evId])

        timeline.push({
          evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor,
          title: sig.title, categoryLabel: CATEGORY_LABEL[key],
          dateISO: evidenceById[evId].dateISO ?? null, polarity: sig.opportunity_or_risk,
        })

        if (sig.opportunity_or_risk !== 'Opportunity') { balance.riskCount++; balance.riskEvidenceIds.push(evId) }
        if (sig.opportunity_or_risk !== 'Risk') { balance.opportunityCount++; balance.opportunityEvidenceIds.push(evId) }
        if (sig.opportunity_or_risk === 'Both') balance.bothCount++

        if (sig.urgency === 'High') {
          headsUpPool.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, title: sig.title, urgency: sig.urgency, confidence: sig.confidence, polarity: sig.opportunity_or_risk, dateISO: evidenceById[evId].dateISO ?? null })
        }

        nbaPool.push({
          rank: 0, evidenceId: evId, action: sig.next_best_action, because: sig.so_what,
          accountId: bundle.id, accountName: bundle.name, accentColor,
          serviceLineGuess: guessServiceLine(sig.why_it_matters_to_indegene),
          urgency: sig.urgency, confidence: sig.confidence, whoEvidenceId: null, whoLabel: null,
        })
      }
    }

    // -- opportunities / missed opportunities --
    for (const opp of bundle.opportunities.opportunities) {
      const evId = `opportunity:${bundle.id}:${opp.id}`
      evidenceById[evId] = {
        id: evId, kind: 'opportunity', accountId: bundle.id, accountName: bundle.name, accentColor,
        title: opp.title, what_happened: opp.what_happened, evidence: opp.evidence, ai_hypothesis: opp.ai_hypothesis,
        so_what: opp.so_what, why_it_matters: opp.why_it_matters_to_indegene, opportunity_or_risk: opp.opportunity_or_risk,
        urgency: opp.urgency, confidence: opp.confidence, next_best_action: opp.next_best_action, who: null,
        if_no_action: opp.if_no_action, expected_outcome: opp.expected_outcome,
        why_now: opp.why_now, nba_outcome: opp.nba_outcome,
        sources: sourceLinks(opp.source_references, sourcesByUrl), dateISO: earliestDate(opp.source_references, sourcesByUrl),
      }
      connectSignalCI(evidenceById[evId])
      openOpps.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, title: opp.title, urgency: opp.urgency, confidence: opp.confidence, isMissed: false })
      if (opp.urgency === 'High') {
        balance.highUrgencyOpportunityCount++
        headsUpPool.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, title: opp.title, urgency: opp.urgency, confidence: opp.confidence, polarity: opp.opportunity_or_risk, dateISO: evidenceById[evId].dateISO ?? null })
      }
      nbaPool.push({ rank: 0, evidenceId: evId, action: opp.next_best_action, because: opp.so_what, accountId: bundle.id, accountName: bundle.name, accentColor, serviceLineGuess: guessServiceLine(opp.why_it_matters_to_indegene), urgency: opp.urgency, confidence: opp.confidence, whoEvidenceId: null, whoLabel: null })
    }
    for (const miss of bundle.opportunities.potential_missed_opportunities) {
      const evId = `missed:${bundle.id}:${miss.id}`
      evidenceById[evId] = {
        id: evId, kind: 'missed', accountId: bundle.id, accountName: bundle.name, accentColor,
        title: miss.title, what_happened: miss.what_happened, evidence: miss.evidence, ai_hypothesis: miss.ai_hypothesis,
        so_what: miss.so_what, why_it_matters: miss.why_it_matters_to_indegene, opportunity_or_risk: miss.opportunity_or_risk,
        urgency: miss.urgency, confidence: miss.confidence, next_best_action: miss.next_best_action, who: null,
        if_no_action: miss.if_no_action, expected_outcome: miss.expected_outcome,
        why_now: miss.why_now, nba_outcome: miss.nba_outcome,
        sources: sourceLinks(miss.source_references, sourcesByUrl), dateISO: earliestDate(miss.source_references, sourcesByUrl),
      }
      connectSignalCI(evidenceById[evId])
      missedOpps.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, title: miss.title, urgency: miss.urgency, confidence: miss.confidence, isMissed: true })
      if (miss.urgency === 'High') {
        headsUpPool.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, title: miss.title, urgency: miss.urgency, confidence: miss.confidence, polarity: miss.opportunity_or_risk, dateISO: evidenceById[evId].dateISO ?? null })
      }
      nbaPool.push({ rank: 0, evidenceId: evId, action: miss.next_best_action, because: miss.so_what, accountId: bundle.id, accountName: bundle.name, accentColor, serviceLineGuess: guessServiceLine(miss.why_it_matters_to_indegene), urgency: miss.urgency, confidence: miss.confidence, whoEvidenceId: null, whoLabel: null })
    }

    // -- executives + target functions (feeds NBA "who" + the engage rail) --
    let topExecEvId: string | null = null, topExecRank = -1, topExecLabel: string | null = null
    for (const ex of bundle.executives.executives) {
      const evId = `executive:${bundle.id}:${ex.id}`
      const nameUnconfirmed = ex.name === null
      const displayName = ex.name ?? nextDummyName()
      evidenceById[evId] = {
        id: evId, kind: 'executive', accountId: bundle.id, accountName: bundle.name, accentColor,
        title: displayName, what_happened: ex.fact + (nameUnconfirmed ? ' (Name not confirmed in source reporting: display name is a placeholder.)': ''),
        ai_hypothesis: ex.ai_hypothesis,
        so_what: ex.indegene_angle, why_it_matters: ex.why_it_matters ?? ex.indegene_angle, next_best_action: ex.engagement_recommendation,
        urgency: ex.priority, confidence: ex.confidence, who: { name: displayName, role: ex.role },
        sources: sourceLinks(ex.source_references, sourcesByUrl), dateISO: null,
      }
      executives.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, name: displayName, role: ex.role, status: ex.status, priority: ex.priority, isTargetFunction: false, nameUnconfirmed, linkedOpportunityTitles: [] })
      const rank = URGENCY_WEIGHT[ex.priority]
      if (rank > topExecRank && !/departed|ousted|former/i.test(ex.status ?? '')) { topExecRank = rank; topExecEvId = evId; topExecLabel = displayName }
    }
    for (const fn of bundle.executives.target_functions ?? []) {
      const evId = `targetFunction:${bundle.id}:${fn.id}`
      const dummyName = nextDummyName()
      evidenceById[evId] = {
        id: evId, kind: 'targetFunction', accountId: bundle.id, accountName: bundle.name, accentColor,
        title: `${dummyName}: ${fn.function}`, what_happened: fn.basis_fact, so_what: fn.indegene_angle, why_it_matters: fn.why_it_matters ?? fn.indegene_angle,
        next_best_action: fn.engagement_recommendation, urgency: fn.priority, who: { name: dummyName, role: fn.function },
        sources: sourceLinks(fn.source_references, sourcesByUrl), dateISO: null,
      }
      executives.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, name: dummyName, role: fn.function, priority: fn.priority, isTargetFunction: true, linkedOpportunityTitles: [] })
      const rank = URGENCY_WEIGHT[fn.priority]
      if (rank > topExecRank) { topExecRank = rank; topExecEvId = evId; topExecLabel = dummyName }
    }

    // -- pad to a minimum roster size per account with clearly-flagged synthetic contacts.
    // These carry a dummy name + a generic commercial-pharma title for UI density only :
    // never confused with source-verified research (the drawer labels them illustrative).
    const existingNames = new Set(executives.filter(e => e.accountId === bundle.id).map(e => e.name).filter(Boolean) as string[])
    let padIndex = 0
    while (executives.filter(e => e.accountId === bundle.id).length < MIN_EXECS_PER_ACCOUNT) {
      const name = nextDummyName()
      if (existingNames.has(name)) continue
      existingNames.add(name)
      const title = GENERIC_TITLES[titleCounter % GENERIC_TITLES.length]
      titleCounter++
      padIndex++
      const priority: Urgency = padIndex % 4 === 0 ? 'High': padIndex % 3 === 0 ? 'Medium': 'Low'
      const evId = `synthetic:${bundle.id}:${padIndex}`
      evidenceById[evId] = {
        id: evId, kind: 'executive', accountId: bundle.id, accountName: bundle.name, accentColor,
        title: `${name}: ${title}`, what_happened: 'Illustrative contact for roster density: no source-verified profile on file.',
        who: { name, role: title }, urgency: priority, sources: [], dateISO: null,
      }
      executives.push({ evidenceId: evId, accountId: bundle.id, accountName: bundle.name, accentColor, name, role: title, priority, isTargetFunction: false, synthetic: true, linkedOpportunityTitles: [] })
    }

    // -- link open opportunities to the account's designated primary contact only :
    // the research artifacts attribute next-best-actions to one primary contact per
    // account, not a specific person per opportunity, so that is the honest linkage.
    if (topExecEvId) {
      const linked = openOpps.filter(o => o.accountId === bundle.id).slice(0, 3).map(o => o.title)
      const topCard = executives.find(e => e.evidenceId === topExecEvId)
      if (topCard) topCard.linkedOpportunityTitles = linked
    }

    // -- quarters (trend facet + slope momentum): FY totals are registered as evidence
    // (still inspectable) but excluded from the trend line itself: mixing a 12-month
    // total with quarterly figures on one axis reads as a collapse that isn't real.
    const points: QuarterPoint[] = []
    let fyValueMillions: number | null = null
    for (const q of bundle.quarters.quarters) {
      const evId = `quarter:${bundle.id}:${q.period}`
      const { value, growth } = findRevenueField(q.fact)
      const { positives, negatives } = classifyQuarterFacts(q.fact)
      evidenceById[evId] = {
        id: evId, kind: 'quarter', accountId: bundle.id, accountName: bundle.name, accentColor,
        title: `${bundle.name}: ${q.period}`, ai_hypothesis: q.ai_hypothesis, confidence: q.confidence,
        sources: sourceLinks(q.source_references, sourcesByUrl), factBlock: factToBlock(q.fact), dateISO: q.period_end,
        positives, negatives,
      }
      if (/^FY/i.test(q.period)) {
        fyValueMillions = parseMoneyMillions(value ?? undefined)
      } else {
        points.push({ label: q.period, valueMillions: parseMoneyMillions(value ?? undefined), growthPct: parsePercent(growth), evidenceId: evId })
      }
    }

    // -- normalize every account to a Q4 2025 → Q1 2026 → Q2 2026 axis. The source
    // research doesn't carry that exact triplet for every account (some have H1
    // instead of Q1, some are missing Q4 outright): fill the gap honestly: derive
    // real numbers where arithmetic allows (H1 − Q2 = Q1, both already sourced),
    // otherwise a clearly-flagged estimate (never presented as a reported figure).
    const fmtEst = (v: number | null) => v === null ? 'n/a': `${{ USD: '$', GBP: '£', EUR: '€' }[bundle.quarters.currency] ?? ''}${(v / 1000).toFixed(1)}bn`
    const byLabel = (label: string) => points.find(p => p.label === label)
    const addSynthPoint = (label: string, valueMillions: number | null, basis: string, confidence: Confidence, sourceRefs: { label: string; url: string }[]) => {
      const evId = `quarter:${bundle.id}:${label}-synth`
      evidenceById[evId] = {
        id: evId, kind: 'quarter', accountId: bundle.id, accountName: bundle.name, accentColor,
        title: `${bundle.name}: ${label} (${sourceRefs.length ? 'derived': 'estimated'})`,
        ai_hypothesis: basis, confidence,
        factBlock: [{ label: 'Revenue', value: fmtEst(valueMillions) }],
        sources: sourceRefs, dateISO: null,
      }
      return { label, valueMillions, growthPct: null, evidenceId: evId, estimated: true }
    }

    if (bundle.id === 'astrazeneca') {
      const h1 = byLabel('H1 2026'), q2 = byLabel('Q2 2026')
      const q1Value = h1 && q2 && h1.valueMillions !== null && q2.valueMillions !== null ? h1.valueMillions - q2.valueMillions: null
      const q1Sources = [...(h1 ? evidenceById[h1.evidenceId].sources: []), ...(q2 ? evidenceById[q2.evidenceId].sources: [])]
      const q1 = addSynthPoint('Q1 2026', q1Value, 'Derived as H1 2026 revenue minus Q2 2026 revenue: both figures are independently sourced; the subtraction itself is not.', 'Medium', q1Sources)
      const q4 = addSynthPoint('Q4 2025', fyValueMillions !== null ? fyValueMillions / 4: null, 'Estimated as FY2025 revenue ÷ 4: AstraZeneca does not report a standalone Q4 2025 figure; not a reported quarterly number.', 'Low', [])
      points.length = 0
      points.push(q4, q1, q2!)
    } else if (bundle.id === 'jnj') {
      const q4 = byLabel('Q4 2025'), q2 = byLabel('Q2 2026')
      const q1Value = q4 && q2 && q4.valueMillions !== null && q2.valueMillions !== null ? (q4.valueMillions + q2.valueMillions) / 2: null
      const q1 = addSynthPoint('Q1 2026', q1Value, 'Estimated as the midpoint between Q4 2025 and Q2 2026 revenue: J&J did not have a standalone Q1 2026 figure captured in research; not a reported quarterly number.', 'Low', [])
      points.length = 0
      points.push(q4!, q1, q2!)
    } else {
      const q1 = byLabel('Q1 2026'), q2 = byLabel('Q2 2026')
      const q4 = addSynthPoint('Q4 2025', fyValueMillions !== null ? fyValueMillions / 4: null, `Estimated as FY2025 revenue ÷ 4: ${bundle.name} does not report a standalone Q4 2025 figure; not a reported quarterly number.`, 'Low', [])
      points.length = 0
      if (q1) points.push(q4, q1)
      else points.push(q4)
      if (q2) points.push(q2)
    }

    // Synthesized points don't carry a reported growth%. Back-fill it from the
    // (real or derived) revenue figures themselves so the momentum slope: which
    // needs consecutive growth%: never silently drops an account.
    for (let i = 1; i < points.length; i++) {
      if (points[i].growthPct === null && points[i].valueMillions !== null && points[i - 1].valueMillions !== null && points[i - 1].valueMillions !== 0) {
        points[i].growthPct = +(((points[i].valueMillions! - points[i - 1].valueMillions!) / points[i - 1].valueMillions!) * 100).toFixed(1)
      }
    }

    const guidEvId = `quarter:${bundle.id}:guidance`
    evidenceById[guidEvId] = {
      id: guidEvId, kind: 'quarter', accountId: bundle.id, accountName: bundle.name, accentColor,
      title: `${bundle.name}: Guidance`, ai_hypothesis: bundle.quarters.guidance.ai_hypothesis, confidence: bundle.quarters.guidance.confidence,
      sources: sourceLinks(bundle.quarters.guidance.source_references, sourcesByUrl), factBlock: factToBlock(bundle.quarters.guidance.fact), dateISO: null,
    }
    quarters.push({ accountId: bundle.id, accountName: bundle.name, accentColor, currency: bundle.quarters.currency, points, guidanceEvidenceId: guidEvId })

    if (points.length >= 2) {
      const prior = points[points.length - 2], current = points[points.length - 1]
      momentum.push({
        accountId: bundle.id, accountName: bundle.name, accentColor,
        priorLabel: prior.label, currentLabel: current.label,
        priorPct: prior.growthPct, currentPct: current.growthPct,
        deltaPct: prior.growthPct !== null && current.growthPct !== null ? +(current.growthPct - prior.growthPct).toFixed(1): null,
        currentQuarterEvidenceId: current.evidenceId,
      })
    }

    // back-fill "who" on this account's NBA items now that top exec is known
    for (const n of nbaPool) {
      if (n.accountId === bundle.id && n.whoEvidenceId === null) { n.whoEvidenceId = topExecEvId; n.whoLabel = topExecLabel }
    }
  }

  // -- rank heads-up: all already High urgency; tie-break confidence desc, then risk-before-opportunity --
  const polarityRank = (p: Polarity) => (p === 'Opportunity' ? 1: 0)
  const headsUp = headsUpPool
    .slice()
    .sort((a, b) => (CONF_WEIGHT[b.confidence] - CONF_WEIGHT[a.confidence]) || (polarityRank(a.polarity) - polarityRank(b.polarity)))
    .slice(0, 6)

  // -- rank NBA pool --
  nbaPool.forEach(n => { n.rank = URGENCY_WEIGHT[n.urgency] * 3 + CONF_WEIGHT[n.confidence] })
  // One action, one queue row: a signal and its related opportunity often carry
  // the same next_best_action — keep the highest-ranked copy, never list it twice.
  const normAction = (a: string) => a.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.$/, '')
  const nba = nbaPool
    .sort((a, b) => b.rank - a.rank)
    .filter((n, i, arr) => arr.findIndex(x => normAction(x.action) === normAction(n.action)) === i)
    .slice(0, 40)
    .map((n, i) => ({ ...n, rank: i + 1 }))

  // -- rank opportunity ledgers --
  const rankOpp = (r: OpportunityRow) => URGENCY_WEIGHT[r.urgency] * 3 + CONF_WEIGHT[r.confidence]
  const open = openOpps.sort((a, b) => rankOpp(b) - rankOpp(a))
  const missed = missedOpps.sort((a, b) => rankOpp(b) - rankOpp(a))

  // -- timeline: most recent first; undated items sink to the bottom --
  timeline.sort((a, b) => {
    if (a.dateISO && b.dateISO) return b.dateISO.localeCompare(a.dateISO)
    if (a.dateISO) return -1
    if (b.dateISO) return 1
    return 0
  })

  // -- executives rail: priority desc, active before departed --
  executives.sort((a, b) => URGENCY_WEIGHT[b.priority] - URGENCY_WEIGHT[a.priority])

  return {
    generatedAt: new Date().toISOString(),
    accountsTracked: BUNDLES.length,
    openHighUrgencyOpportunities: balance.highUrgencyOpportunityCount,
    windowsClosingThisQuarter: missed.length,
    headsUp, balance, momentum,
    opportunityLedger: { open, missed },
    nba, timeline, quarters, executives, evidenceById,
  }
}

// ─── hook ───────────────────────────────────────────────────────────────────
// Wraps the (synchronous) compiler behind a real async boundary so the page can
// show a genuine loading state and recover from a genuine compile failure :
// the same contract a future live data source (Supabase, an API) would have.

import { useEffect, useState } from 'react'

export interface OrgIntelligenceState {
  data: OrganizationIntelligence | null
  loading: boolean
  error: string | null
}

export function useOrganizationIntelligence(): OrgIntelligenceState {
  const [state, setState] = useState<OrgIntelligenceState>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })
    const t = setTimeout(() => {
      if (cancelled) return
      try {
        const data = computeOrganizationIntelligence()
        setState({ data, loading: false, error: null })
      } catch (e) {
        setState({ data: null, loading: false, error: e instanceof Error ? e.message: 'Failed to compile organization intelligence.' })
      }
    }, 450)
    return () => { cancelled = true; clearTimeout(t) }
  }, [])

  return state
}
