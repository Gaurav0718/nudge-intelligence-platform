import { useCallback, useState, useRef, useLayoutEffect, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ArrowUp, AlertTriangle, TrendingDown, TrendingUp, Target, Zap, Cpu, Handshake, Compass, Eye, type LucideIcon } from 'lucide-react'
import { Card } from '../components/shared/ui'
import { Bullets } from '../components/shared/Bullets'
import EvidenceDrawer, { type DrawerView } from '../components/shared/EvidenceDrawer'
import type { EvidenceItem } from '../lib/orgIntelligence'
import { avatarUrl, initialsOf } from '../lib/avatars'

/**
 * HOME: Executive Intelligence "War Room". Follows the Company doc's mental model
 * (Signal → Connected Intelligence → Why It Matters → Next Best Action) over five
 * strategic accounts (AstraZeneca, GSK, J&J, Sanofi, Novartis). Rendered in the
 * app's light theme + card-hover system. Grouped into readable bands, each in a
 * fixed 2- or 3-column grid (never an auto-fit stretch); every panel scrolls to
 * its expanded detail below, and rows open the evidence drawer with dense,
 * multi-field evidence (facts, positives/negatives, AI hypothesis, NBA + owner).
 * Account Intelligence is deliberately the LAST band: everything above is the
 * portfolio-level synthesis; the account cards are the per-account drill-in.
 * Figures are the doc's illustrative demo values.
 */

/* ============ COLOUR TOKENS: DICHROMATIC (navy + gold shades only) ============
   Semantics: NAVY family = threat / risk / structural intensity;
   GOLD family = opportunity / positive. Shade encodes degree.               */
type RAG = 'red' | 'amber' | 'green'
type Tone = RAG | 'blue' | 'purple'
const CVAR: Record<Tone, string> = { red: '#12294a', amber: '#b89428', green: '#D4AF37', blue: '#3a5a8c', purple: '#1B365D' }
const CBG: Record<Tone, string> = { red: 'rgba(18,41,74,0.12)', amber: 'rgba(184,148,40,0.15)', green: 'rgba(212,175,55,0.18)', blue: 'rgba(58,90,140,0.12)', purple: 'rgba(27,54,93,0.1)' }
const CHEX: Record<Tone, string> = { red: '#12294a', amber: '#b89428', green: '#D4AF37', blue: '#3a5a8c', purple: '#1B365D' }
const statusColor = (s: string): RAG => s === 'HIGH' ? 'red': (s === 'ELEVATED' || s === 'MODERATE') ? 'amber': 'green'
const polarityFor = (t: Tone): 'Opportunity' | 'Risk' | 'Both' => t === 'green' ? 'Opportunity': t === 'red' ? 'Risk': 'Both'

/* ============ DATA MODEL ============ */
interface Account {
  key: string; name: string; short: string; score: number; status: string; color: RAG
  risk: number; opp: number; pen: number; opp_xy: number; strat: string; momentum: string
  revenueLine: string; growth: string; clientGrowth: number; ourGrowth: number; trend: number[]
  signal: string; chain: string[]; soWhat: string; nba: string; sources: string[]
  positives: string[]; negatives: string[]; hypothesis: string; confidence: 'High' | 'Medium'
}
const ACCOUNTS: Account[] = [
  {
    key: 'gsk', name: 'GSK', short: 'GSK', score: 81, status: 'HIGH', color: 'red', risk: 4.2, opp: 3.2, pen: 15, opp_xy: 85, strat: 'ATTACK', momentum: '↑',
    revenueLine: 'FY2025 £32.7B · +7% CER', growth: 'Specialty Medicines £13.5B · +17% CER', clientGrowth: 7, ourGrowth: 2, trend: [20, 28, 34, 30, 45, 52, 58, 64, 70, 75, 79, 81],
    signal: 'GSK is using AI in drug discovery via a Relation Therapeutics collaboration worth up to $110M, combining human cellular datasets with AI models for target discovery. FY2025 turnover £32.7B (+7% CER); 58 pipeline assets, 17 in Phase III/registration.',
    chain: ['AI investment', 'R&D workflow transformation', 'Data / model infrastructure need ↑', 'Traditional manual services ↓', 'Opportunity → AI-enabled scientific/clinical services'],
    soWhat: 'GSK\'s growth and AI investment suggest opportunity is expanding, but the service mix required to capture it is changing.',
    nba: 'Map current GSK engagements against AI-enabled R&D, data, medical and commercialization capabilities; identify services most exposed to internal automation and 2-3 adjacent AI-enabled offers.',
    sources: ['GSK 2025 Annual Report', 'Reuters: Relation Therapeutics'],
    positives: ['FY2025 turnover £32.7B, +7% CER', 'Specialty Medicines £13.5B, +17% CER: 58 pipeline assets, 17 in Phase III/registration'],
    negatives: ['AI-enabled automation may reduce demand for traditional manual services'],
    hypothesis: 'AI investment is becoming an operating capability, not an experiment: the service mix required to capture GSK\'s growth is shifting toward AI-enabled scientific and clinical work.',
    confidence: 'High',
  },
  {
    key: 'jnj', name: 'Johnson & Johnson', short: 'J&J', score: 28, status: 'LOW', color: 'green', risk: 0, opp: 2.8, pen: 80, opp_xy: 88, strat: 'EXPAND', momentum: '↑↑',
    revenueLine: 'Q2 2026 $25.31B · +6.6% YoY', growth: 'FY2026 guidance midpoint $101.1B', clientGrowth: 6.6, ourGrowth: 5, trend: [30, 29, 27, 26, 28, 25, 24, 26, 25, 24, 27, 28],
    signal: 'J&J posted Q2 2026 sales of $25.31B (+6.6% YoY) and raised its 2026 midpoint to $101.1B: on track to exceed $100B for the first time. Simultaneously deploying capital: Sail Biomedicines ($785M initial + acquisition option) and Firefly Bio strengthen oncology.',
    chain: ['Strong revenue growth', 'Raised guidance + pipeline investment', 'Portfolio complexity ↑', 'More assets need development + launch support', 'Potential services whitespace'],
    soWhat: 'J&J isn\'t simply growing; it is reinvesting into new therapeutic platforms, creating downstream work around evidence, medical, regulatory, launch and commercialization.',
    nba: 'Map new pipeline assets and acquisitions to current J&J relationships; identify programs where current penetration is low or zero.',
    sources: ['J&J Investor Relations: Q2 2026', 'WSJ: Sail / Firefly Bio'],
    positives: ['Q2 2026 sales $25.31B, +6.6% YoY', 'FY2026 guidance midpoint raised to $101.1B: on track to exceed $100B for the first time'],
    negatives: ['Sail Biomedicines ($785M) and Firefly Bio deal costs revised 2026 EPS expectations downward'],
    hypothesis: 'J&J isn\'t simply growing: it\'s reinvesting into new therapeutic platforms, creating downstream demand across evidence, medical, regulatory, launch and commercialization.',
    confidence: 'High',
  },
  {
    key: 'sanofi', name: 'Sanofi', short: 'Sanofi', score: 64, status: 'ELEVATED', color: 'amber', risk: 1.6, opp: 1.5, pen: 35, opp_xy: 45, strat: 'PROTECT', momentum: '↗ / risk',
    revenueLine: 'Q2 Dupixent €5.15B · R&D €2.23B', growth: '2026 outlook raised', clientGrowth: 9, ourGrowth: 3, trend: [38, 40, 37, 42, 48, 45, 50, 54, 58, 60, 62, 64],
    signal: 'Sanofi raised its 2026 sales outlook on strong Dupixent demand (Q2 €5.15B, R&D €2.23B) while discontinuing multiple pipeline programs and recording impairments. It describes itself as an R&D-driven, AI-powered biopharma: Digital/AI is strategically central. ExCo evolved (Jul 21).',
    chain: ['Dupixent strength', 'Pipeline rationalization + leadership change', 'AI-led strategy', 'High urgency to build future growth engines', 'Demand → R&D productivity + portfolio + launch'],
    soWhat: 'Strong current growth masks a strategic need to diversify future revenue and improve R&D productivity.',
    nba: 'Prioritize engagements tied to portfolio acceleration, AI-enabled development, evidence generation and launches beyond Dupixent.',
    sources: ['Reuters: Sanofi Q2', 'Sanofi Investor Relations'],
    positives: ['Q2 Dupixent sales €5.15B', '2026 sales outlook raised on Dupixent strength'],
    negatives: ['Multiple pipeline programs discontinued with impairment charges', 'Executive Committee evolved Jul 21: buying committee reset'],
    hypothesis: 'Strong current growth masks a strategic need to diversify future revenue and improve R&D productivity: the AI-powered biopharma strategy is central, not experimental.',
    confidence: 'Medium',
  },
  {
    key: 'az', name: 'AstraZeneca', short: 'AstraZeneca', score: 41, status: 'MODERATE', color: 'amber', risk: 3.7, opp: 1.2, pen: 68, opp_xy: 38, strat: 'PROTECT', momentum: '↑',
    revenueLine: 'Oncology / BioPharma / Rare Disease', growth: '$80B 2030 sales target', clientGrowth: 8, ourGrowth: 4, trend: [30, 32, 29, 35, 33, 37, 36, 39, 38, 40, 42, 41],
    signal: 'AZ is science-led across Oncology, BioPharmaceuticals and Rare Disease (Alexion), targeting $80B sales by 2030 with 45% of revenue from oncology. Two capital commitments: a $50B US manufacturing pledge and a $15B China R&D expansion. Live competitive-tech threat: Evinova\'s Accenture/AWS partnership.',
    chain: ['Innovation + oncology + AI direction', 'Country President succession', 'Digital-health innovation hub standing up', 'Partnership window before mandates lock', 'Opportunity → digital-health partnership'],
    soWhat: 'Growth opportunity remains high, but the account should prioritize capabilities aligned with AZ\'s innovation and AI direction while monitoring internal capability build-out.',
    nba: 'Engage the new digital-health hub sponsor early; position AI-enabled development against the Evinova competitive threat.',
    sources: ['AstraZeneca Investor Relations', 'Company strategy disclosures'],
    positives: ['$80B 2030 sales target, 45% from oncology', '$50B US manufacturing pledge + $15B China R&D expansion'],
    negatives: ['Evinova\'s Accenture/AWS partnership is a live competitive-technology threat'],
    hypothesis: 'Growth opportunity remains high, but capability alignment with AZ\'s innovation/AI direction matters more than generic digital-transformation positioning.',
    confidence: 'Medium',
  },
  {
    key: 'novartis', name: 'Novartis', short: 'Novartis', score: 33, status: 'LOW', color: 'green', risk: 2.9, opp: 1.0, pen: 28, opp_xy: 15, strat: 'WATCH', momentum: '→',
    revenueLine: 'FY2025 $54.532B · +8%', growth: 'Q2 2026 $14.408B · +1% cc', clientGrowth: 8, ourGrowth: 1, trend: [25, 24, 26, 23, 25, 22, 24, 23, 25, 24, 32, 33],
    signal: 'Novartis generated $54.532B net sales in 2025 (+8%), operating income +21%. In Q2 2026 sales reached $14.408B (+3% USD, only +1% cc); operating income −2% and free cash flow −12%. Bolt-on M&A adding assets with limited launch infrastructure.',
    chain: ['Strong 2025 growth', 'Q2 momentum moderates', 'Innovation remains central', 'Execution on pipeline/product growth matters more', 'Opportunity → commercialization + launch effectiveness'],
    soWhat: 'Novartis remains financially strong, but slowing quarterly momentum makes converting innovation into commercial growth more strategically important.',
    nba: 'Compare Company penetration against Novartis priority brands/assets; surface launch/commercialization whitespace.',
    sources: ['Novartis Q2 2026 results', 'Novartis FY2025 results'],
    positives: ['FY2025 net sales $54.532B, +8%; operating income +21%'],
    negatives: ['Q2 2026 sales +1% cc only; operating income −2%, free cash flow −12%', 'Bolt-on M&A adding assets with limited launch infrastructure: early insourcing-pilot signal'],
    hypothesis: 'Slowing quarterly momentum makes converting innovation into commercial growth more strategically important than the strong FY headline suggests.',
    confidence: 'Medium',
  },
]
const ACC = (k: string) => ACCOUNTS.find(a => a.key === k)!

const TOTALS = { criticalThreats: 3, revenueAtRisk: 12.4, riskDeltaPct: 18, opportunities: 4, opportunityValue: 8.7, execActions: 2, portfolioThreat: 81, currentRevenue: 58.2, netExposure: -3.7 }
const HEADLINE = [
  'Portfolio remains growth-rich, but client-side AI adoption, portfolio restructuring and aggressive R&D investment are changing where services demand will emerge.',
  'Company flags immediate expansion around AI-enabled R&D, commercialization and launch support, while surfacing where internal client capability may reduce traditional outsourcing demand.'
]

const RADAR = [
  { axis: 'Competition', v: 88 }, { axis: 'AI Disruption', v: 82 }, { axis: 'Client Insourcing', v: 78 },
  { axis: 'Delivery', v: 58 }, { axis: 'Revenue', v: 55 }, { axis: 'Leadership', v: 48 },
  { axis: 'Market', v: 35 }, { axis: 'People', v: 15 },
]

const HEATCOLS = ['Regulatory', 'Medical', 'Clinical', 'Commercial', 'Data & AI', 'Digital', 'Market Access']
const HEATDATA: Record<string, Record<string, RAG>> = {
  gsk: { Regulatory: 'amber', Medical: 'green', Clinical: 'red', Commercial: 'amber', 'Data & AI': 'red', Digital: 'red', 'Market Access': 'amber' },
  jnj: { Regulatory: 'green', Medical: 'green', Clinical: 'amber', Commercial: 'red', 'Data & AI': 'amber', Digital: 'green', 'Market Access': 'green' },
  sanofi: { Regulatory: 'amber', Medical: 'red', Clinical: 'red', Commercial: 'amber', 'Data & AI': 'red', Digital: 'amber', 'Market Access': 'green' },
  az: { Regulatory: 'green', Medical: 'amber', Clinical: 'green', Commercial: 'amber', 'Data & AI': 'amber', Digital: 'red', 'Market Access': 'green' },
  novartis: { Regulatory: 'amber', Medical: 'amber', Clinical: 'amber', Commercial: 'red', 'Data & AI': 'green', Digital: 'green', 'Market Access': 'amber' },
}

interface Change { tag: 'critical' | 'opportunity'; time: string; acc: string; cat: string; impact: string; title: string; body: string; nba: string; val: string }
const CHANGES: Record<string, Change[]> = {
  '24H': [
    { tag: 'opportunity', time: '2h ago', acc: 'gsk', cat: 'AI / R&D', impact: 'High Opportunity', title: 'GSK expands AI-based drug discovery', body: 'GSK\'s Relation Therapeutics collaboration adds evidence that AI-enabled R&D is becoming an operating capability, not an experiment.', nba: 'Run an executive AI/R&D workshop with GSK R&D leadership anchored on target-discovery use cases before competitor AI ownership locks.', val: '$3.2M' },
    { tag: 'opportunity', time: '5h ago', acc: 'jnj', cat: 'M&A / Innovation', impact: 'High Opportunity', title: 'J&J expands next-generation therapeutic investment', body: 'New therapeutic platforms (Sail, Firefly Bio) can create downstream needs across development, regulatory, evidence and commercialization.', nba: 'Map Sail and Firefly assets to J&J stakeholders and Company launch capabilities before program teams staff up independently.', val: '$2.8M' },
  ],
  '7D': [
    { tag: 'critical', time: '2 days ago', acc: 'sanofi', cat: 'Financial + R&D', impact: 'Opportunity + Risk', title: 'Sanofi raises growth outlook but pipeline concerns intensify', body: 'Strong Dupixent growth supports near-term momentum while pipeline rationalization increases urgency around future growth engines.', nba: 'Escalate executive engagement with Sanofi\'s new ExCo owner around portfolio productivity and launch acceleration beyond Dupixent.', val: '$1.5M' },
    { tag: 'critical', time: '4 days ago', acc: 'sanofi', cat: 'Leadership', impact: 'Relationship Risk', title: 'Sanofi Executive Committee evolves (Jul 21)', body: 'ExCo changes reset the buying committee our relationships anchored to; vendor list likely to reopen.', nba: 'Re-anchor Sanofi relationships to the post-July ExCo and map the newly empowered decision-makers inside the 90-day window.', val: '$1.6M' },
  ],
  '30D': [
    { tag: 'critical', time: '12 days ago', acc: 'az', cat: 'Delivery', impact: 'Revenue Risk', title: 'AstraZeneca delivery quality trending down on two regulatory programs', body: 'Two AZ regulatory programs show a delivery-score decline and CSAT drop: renewal and expansion revenue exposed if not recovered.', nba: 'Run an executive-sponsor review on the two AZ regulatory programs before the Q4 renewal decision.', val: '$3.7M' },
    { tag: 'opportunity', time: '20 days ago', acc: 'az', cat: 'Leadership', impact: 'Opportunity', title: 'AstraZeneca country-president succession opens digital-health window', body: 'A leadership transition is standing up a digital-health innovation hub: a partnership window before mandates lock.', nba: 'Engage the incoming digital-health hub sponsor with an AI-enabled development proposition before Evinova locks the mandate.', val: '$1.2M' },
  ],
  'QTR': [
    { tag: 'critical', time: 'this quarter', acc: 'novartis', cat: 'Client Insourcing', impact: 'Retention Risk', title: 'Novartis client-insourcing pilot underway in one service line', body: 'Early-stage, but the pattern historically precedes broader vendor consolidation: retention play needed now.', nba: 'Stand up a Novartis retention plan anchored to launch and commercialization support before the insourcing pilot scales.', val: '$2.9M' },
    { tag: 'opportunity', time: 'this quarter', acc: 'gsk', cat: 'AI / Whitespace', impact: 'High Opportunity', title: 'GSK AI spend up 42%: whitespace in AI-enabled commercialization', body: 'GSK AI spend rising while our AI-services penetration is low: a direct whitespace for governed AI-enabled offers.', nba: 'Present a governed-AI commercialization offer to GSK mapped to the R&D stakeholders behind the 42% AI spend increase.', val: '$3.2M' },
  ],
}

interface ChainDef { acc: string; nodes: { t: string; v: string; c: Tone }[]; hypothesis: string; confidence: number; nba: string }
const CONNECTED_CHAINS: ChainDef[] = [
  {
    acc: 'gsk', nodes: [{ t: 'GSK AI Investment', v: '↑42%', c: 'purple' }, { t: 'R&D Workflow Shift', v: '', c: 'blue' }, { t: 'Competitor Activity ↑', v: '', c: 'red' }, { t: 'Our AI Penetration', v: 'LOW', c: 'amber' }, { t: 'Whitespace Opportunity', v: '$3.2M', c: 'green' }],
    hypothesis: 'GSK\'s AI investment is accelerating while our AI-services penetration on the account remains low: a direct whitespace, not a threat, if we move first.',
    confidence: 87, nba: 'Establish R&D executive entry before AI capability ownership consolidates around competitors.',
  },
  {
    acc: 'sanofi', nodes: [{ t: 'Sanofi ExCo Reset', v: '3 roles', c: 'purple' }, { t: 'New CEO Priorities', v: '', c: 'blue' }, { t: 'Vendor List Reopens', v: '', c: 'amber' }, { t: 'Relationship Exposure', v: '$1.6M', c: 'red' }, { t: 'Engagement Window', v: '90 days', c: 'green' }],
    hypothesis: 'Leadership reset resets the buying committee our relationships anchored to: the vendor list reopening is a 90-day window, not a permanent loss.',
    confidence: 74, nba: 'Refresh stakeholder map and identify newly empowered decision makers within the engagement window.',
  },
  {
    acc: 'jnj', nodes: [{ t: 'J&J Pipeline Investment', v: '$785M', c: 'purple' }, { t: 'New Assets, No Launch Infra', v: '', c: 'blue' }, { t: 'Development + Launch Demand', v: '', c: 'amber' }, { t: 'Low Penetration', v: '', c: 'red' }, { t: 'Commercialization Whitespace', v: '$2.8M', c: 'green' }],
    hypothesis: 'New therapeutic platforms are outpacing J&J\'s existing launch/commercialization footprint: the whitespace opens as fast as the assets do.',
    confidence: 81, nba: 'Build an asset → stakeholder → capability → opportunity map before program teams staff up independently.',
  },
  {
    acc: 'az', nodes: [{ t: 'AZ Country-President Succession', v: '', c: 'purple' }, { t: 'New Digital-Health Mandate', v: '', c: 'blue' }, { t: 'Partnership Window Opens', v: '', c: 'amber' }, { t: 'Evinova Competitive Threat', v: 'Accenture/AWS', c: 'red' }, { t: 'AI-Enabled Development Opportunity', v: '$1.2M', c: 'green' }],
    hypothesis: 'A leadership transition at AZ is opening a partnership window before mandates lock: and Evinova\'s Accenture/AWS partnership means the window won\'t stay open long.',
    confidence: 76, nba: 'Engage the digital-health hub sponsor before capability ownership consolidates around Evinova.',
  },
  {
    acc: 'novartis', nodes: [{ t: 'Novartis Bolt-on M&A', v: '3 deals', c: 'purple' }, { t: 'New Assets, No Launch Infra', v: '', c: 'blue' }, { t: 'Client Insourcing Pilot', v: '', c: 'amber' }, { t: 'Retention Risk', v: '$2.9M', c: 'red' }, { t: 'Integration Whitespace', v: 'open', c: 'green' }],
    hypothesis: 'Novartis is acquiring assets faster than it can build launch infrastructure for them: that gap is either our retention risk or our entry point, depending on who fills it first.',
    confidence: 68, nba: 'Propose an integration-support engagement before the insourcing pilot scales.',
  },
]

interface Exec { acc: string; name: string; title: string; focus: string; signal: RAG; context: string; relationship: 'Strong' | 'Moderate' | 'Weak'; influence: 'High' | 'Medium' | 'Low'; engagement: string }
// Real named executives pulled from the account dossiers (same people the
// consolidated views show). Top three (GSK, J&J, Sanofi) lead: the doc's
// three priority accounts: followed by AZ and Novartis.
const EXEC_MOVES: Exec[] = [
  { acc: 'gsk', name: 'Luke Miels', title: 'Chief Executive Officer', focus: 'Specialty medicines, vaccines & operational execution: AI/R&D productivity', signal: 'red', context: 'New CEO (from Jan 2026), a commercial-first operator. GSK\'s 2025 strategy centers on a high-quality specialty-medicines and vaccines portfolio, heavy on operational execution.', relationship: 'Weak', influence: 'High', engagement: 'Position around accelerating portfolio execution and AI-enabled R&D: not generic digital transformation. Early-tenure signal-setting window is open now.' },
  { acc: 'jnj', name: 'Joaquin Duato', title: 'Chairman & Chief Executive Officer', focus: 'Portfolio expansion: Sail Biomedicines & Firefly Bio, $101.1B guidance', signal: 'green', context: 'Steering J&J past $100B for the first time while reinvesting aggressively into new therapeutic platforms (Sail $785M, Firefly Bio oncology).', relationship: 'Moderate', influence: 'High', engagement: 'Map new pipeline assets to current relationships before program teams staff up independently; lead with launch/commercialization capability.' },
  { acc: 'sanofi', name: 'Belén Garijo', title: 'Chief Executive Officer', focus: 'Portfolio transformation post-ExCo reset: AI-powered biopharma', signal: 'amber', context: 'Leading Sanofi\'s AI-powered biopharma strategy through a July 21 Executive Committee reshuffle that resets the buying committee our relationships anchored to.', relationship: 'Weak', influence: 'High', engagement: 'Refresh the stakeholder map inside the 90-day window and re-anchor through the existing commercial champion.' },
  { acc: 'az', name: 'Sir Pascal Soriot', title: 'Chief Executive Officer', focus: 'Oncology-led $80B-by-2030 target; digital-health hub standing up', signal: 'amber', context: 'Driving AZ toward $80B sales by 2030 with 45% from oncology; a country-president succession is standing up a digital-health innovation hub.', relationship: 'Moderate', influence: 'Medium', engagement: 'Engage the incoming hub sponsor early, before the Evinova (Accenture/AWS) relationship consolidates the mandate.' },
  { acc: 'novartis', name: 'Vas Narasimhan', title: 'Chief Executive Officer', focus: 'Post-M&A commercial integration as Q2 momentum moderates', signal: 'green', context: 'Strong FY2025 (+8%) but softening Q2 (+1% cc); bolt-on M&A is adding assets faster than launch infrastructure.', relationship: 'Strong', influence: 'Medium', engagement: 'Use the existing commercial relationship to scope an integration-support engagement before the insourcing pilot scales.' },
]

interface Nba { icon: LucideIcon; color: Tone; prio: string; acc: string; title: string; why: string; impact: string; owner: string }
const NBA_LIST: Nba[] = [
  { icon: Cpu, color: 'red', prio: 'P1', acc: 'gsk', title: 'Expand GSK AI / R&D relationship', why: 'AI drug-discovery investment + Specialty Medicines +17% CER + pipeline scale.', impact: 'High · Immediate', owner: 'Ritesh Kumar' },
  { icon: Target, color: 'green', prio: 'P1', acc: 'jnj', title: 'Map J&J pipeline-driven whitespace', why: 'Q2 +6.6%, guidance raised to $101.1B, active portfolio investment.', impact: 'High', owner: 'Unassigned' },
  { icon: Handshake, color: 'amber', prio: 'P1', acc: 'sanofi', title: 'Engage Sanofi transformation stakeholders', why: 'Leadership evolution + pipeline rationalization + AI/R&D strategy.', impact: 'High', owner: 'Kanchan B.' },
  { icon: Compass, color: 'amber', prio: 'P2', acc: 'az', title: 'Position against Evinova at AZ digital-health hub', why: 'New hub sponsor + competitive-tech threat (Accenture/AWS).', impact: 'Medium-High', owner: 'Unassigned' },
  { icon: TrendingUp, color: 'green', prio: 'P2', acc: 'novartis', title: 'Novartis commercial-acceleration analysis', why: 'FY growth strong while Q2 momentum moderated (+1% cc).', impact: 'Medium-High', owner: 'Gaurav M.' },
  { icon: Eye, color: 'blue', prio: 'P3', acc: 'novartis', title: 'Monitor Novartis insourcing pilot', why: 'Early-stage signal; watch before it consolidates.', impact: 'Watch', owner: 'Gaurav M.' },
]

const BIG_BETS = [
  { acc: 'gsk', title: 'AI-enabled R&D: GSK', started: 'Q1', progress: 15, stage: 'Discovery', note: 'Discovery-stage: no commercial movement yet despite a Q1 start.' },
  { acc: 'jnj', title: 'J&J oncology expansion', started: 'Q2', progress: 60, stage: 'Proposal', note: 'Proposal stage, on track: the highest-progress bet in the portfolio.' },
  { acc: 'sanofi', title: 'Sanofi portfolio transformation', started: 'Q2', progress: 5, stage: 'Hypothesis', note: 'Hypothesis stage only: escalate before the engagement window closes.' },
  { acc: 'az', title: 'AZ digital-health partnership', started: 'Q2', progress: 25, stage: 'Relationship', note: 'Relationship stage: needs the new hub sponsor engaged directly.' },
]
const BET_STAGES = ['Hypothesis', 'Relationship', 'Discovery', 'Proposal', 'Pilot', 'Revenue']

const WHITESPACE = [
  { rank: 1, acc: 'jnj', title: 'New pipeline / commercialization', why: '$25.3B Q2 + raised guidance + active therapeutic investment.', conf: 'High', ease: 70, value: 88, next: 'Map Sail, Firefly and Halda assets to launch and evidence capabilities before program teams staff up independently.' },
  { rank: 2, acc: 'gsk', title: 'AI-enabled R&D', why: 'External AI drug-discovery partnership + Specialty Medicines growth.', conf: 'High', ease: 40, value: 84, next: 'Run an executive AI/R&D discovery workshop with GSK R&D leadership anchored on target-discovery use cases.' },
  { rank: 3, acc: 'sanofi', title: 'R&D productivity / portfolio transformation', why: 'Pipeline rationalization + AI strategy + leadership transition.', conf: 'Medium', ease: 45, value: 79, next: 'Escalate executive engagement with Sanofi\'s new ExCo owner around portfolio productivity and launch acceleration.' },
  { rank: 4, acc: 'az', title: 'Digital-health hub partnership', why: 'Country-president succession opens a partnership window.', conf: 'Medium', ease: 55, value: 74, next: 'Engage the incoming digital-health hub sponsor with an AI-enabled development proposition before Evinova locks the mandate.' },
]

const PIPELINE = [
  { q: 'Q3', pct: 92, committed: 5.4, best: 1.8, risk: 0.6 },
  { q: 'Q4', pct: 74, committed: 3.1, best: 2.2, risk: 1.4 },
  { q: 'Q1', pct: 51, committed: 1.9, best: 1.6, risk: 1.9 },
]

const CONCENTRATION = [
  { acc: 'az', pct: 34 }, { acc: 'gsk', pct: 28 }, { acc: 'jnj', pct: 18 }, { acc: 'novartis', pct: 12 }, { acc: 'sanofi', pct: 8 },
]

/* ============ Connected Intelligence — per-account module signals ============ */
// Independent signals across modules that converge on each account's story.
// Grounded in the account data above (chains, exec moves, changes). Builders pull
// the relevant account's modules so every drawer reads as connected intelligence,
// not a single metric. `null` account → portfolio-level modules.
type CIModule = { module: string; signal: string }
const CI_MODULES: Record<string, CIModule[]> = {
  gsk: [
    { module: 'Market Intel', signal: 'AI drug-discovery investment up 42% (Relation Therapeutics collaboration).' },
    { module: 'Competition', signal: 'Competitor AI/R&D activity rising on the account.' },
    { module: 'Sales & Growth', signal: 'Company AI-services penetration low — a direct whitespace, not a threat.' },
    { module: 'Relationship', signal: 'New CEO Luke Miels (Jan 2026); early-tenure signal-setting window open.' },
  ],
  jnj: [
    { module: 'Market Intel', signal: 'Q2 +6.6%, guidance raised to $101.1B; $785M new-platform investment (Sail, Firefly Bio).' },
    { module: 'Sales & Growth', signal: 'New assets outpace launch/commercialization footprint; penetration low.' },
    { module: 'Delivery', signal: 'No launch infrastructure yet mapped to the new therapeutic platforms.' },
    { module: 'Relationship', signal: 'CEO Joaquin Duato reinvesting aggressively; relationship moderate.' },
  ],
  sanofi: [
    { module: 'Relationship', signal: 'Jul 21 ExCo reset (3 roles) reopened the buying committee for ~90 days.' },
    { module: 'Market Intel', signal: 'Strong Dupixent growth alongside pipeline rationalization and AI-powered biopharma strategy.' },
    { module: 'Sales & Growth', signal: 'Relationships anchored to displaced sponsors; $1.6M exposure.' },
    { module: 'Competition', signal: 'Reopened vendor list invites competitor entry during the window.' },
  ],
  az: [
    { module: 'Relationship', signal: 'Country-president succession standing up a digital-health innovation hub.' },
    { module: 'Competition', signal: 'Evinova (AstraZeneca/Accenture/AWS) moving to consolidate the mandate.' },
    { module: 'Delivery', signal: 'Two regulatory programs trending down on delivery score + CSAT; $3.7M exposed.' },
    { module: 'Market Intel', signal: 'Oncology-led $80B-by-2030 target; AI-enabled development demand rising.' },
  ],
  novartis: [
    { module: 'Market Intel', signal: 'Bolt-on M&A (3 deals) adding assets faster than launch infrastructure.' },
    { module: 'Delivery', signal: 'Client-insourcing pilot underway in one service line — historical precursor to consolidation.' },
    { module: 'Sales & Growth', signal: 'Integration whitespace open; $2.9M retention exposure.' },
    { module: 'Relationship', signal: 'Strong CEO relationship (Vas Narasimhan) — usable to scope integration support.' },
  ],
  portfolio: [
    { module: 'Market Intel', signal: 'Client-side AI adoption, portfolio restructuring and R&D investment reshaping services demand.' },
    { module: 'Competition', signal: 'Evinova, IQVIA and Accenture moving on AI/commercialization mandates across accounts.' },
    { module: 'Sales & Growth', signal: 'AI-enabled offers under-penetrated where client budgets are rising fastest.' },
    { module: 'Relationship', signal: 'Leadership changes at Sanofi and AZ reset shortlists inside overlapping ~90-day windows.' },
  ],
}
const ciFor = (acc: string | null): CIModule[] => CI_MODULES[acc ?? 'portfolio'] ?? CI_MODULES.portfolio

/* ============ evidence synth ============ */
function ev(acc: string | null, title: string, body: string, tone: Tone, extra?: Partial<EvidenceItem>): EvidenceItem {
  const a = acc ? ACC(acc): null
  return {
    id: `wr:${title}`, kind: 'signal', accountId: acc, accountName: a?.name ?? 'Portfolio', accentColor: CHEX[tone], title,
    what_happened: body, urgency: tone === 'red' ? 'High': tone === 'amber' ? 'Medium': 'Low',
    opportunity_or_risk: polarityFor(tone), sources: (a?.sources ?? []).map(s => ({ label: s, url: '#' })), dateISO: null, ...extra,
  }
}
// Full account dossier: shared by the Account Intelligence card and the Radar/Early-Warning detail cards.
function accountEv(a: Account, title: string, body: string, so_what?: string, next_best_action?: string): EvidenceItem {
  return ev(a.key, title, body, a.color, {
    categoryLabel: 'Account Intelligence', confidence: a.confidence, evidence: a.chain.join('  →  '),
    positives: a.positives, negatives: a.negatives, ai_hypothesis: a.hypothesis,
    factBlock: [
      { label: 'Momentum', value: a.momentum }, { label: 'Threat score', value: `${a.score}/100 · ${a.status}` },
      { label: 'Revenue at risk', value: `$${a.risk}M` }, { label: 'Opportunity value', value: `$${a.opp}M` }, { label: 'Strategy', value: a.strat },
    ],
    so_what: so_what ?? a.soWhat,
    priority: a.status === 'Critical' ? 'Critical' : a.score >= 60 ? 'High' : 'Medium',
    if_no_action: `${a.name}: ${a.negatives[0] ?? 'the current window narrows'}. ${a.hypothesis}`,
    nbas: [{
      action: next_best_action ?? a.nba,
      actor: 'Account team + relevant service-line lead',
      target: `${a.name} leadership`,
      whyNow: `Momentum is ${a.momentum.toLowerCase()} and threat score is ${a.score}/100 (${a.status}) — the strategy window (${a.strat}) is live now.`,
      outcome: so_what ?? a.soWhat,
    }],
  })
}

export default function HomePage() {
  const [stack, setStack] = useState<DrawerView[]>([])
  const open = useCallback((eyebrow: string, title: string, items: EvidenceItem[]) => setStack(s => [...s, { eyebrow, title, items }]), [])
  const scrollTo = useCallback((id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), [])
  const [tab, setTab] = useState('24H')

  // Back-to-top FAB: always visible on the right; returns to the top.
  const topRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const backToTop = useCallback(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), [])

  return (
    <div className="home-light-root" style={{ margin: 'calc(var(--page-pad-y) * -1) calc(var(--page-pad-x) * -1) calc(var(--page-pad-b) * -1)', padding: 'var(--page-pad-y) var(--page-pad-x) 56px', minHeight: 'calc(100vh - var(--topbar-h))' }}>
      {/* Header */}
      <div ref={topRef} style={{ maxWidth: 820, marginBottom: 20, scrollMarginTop: 'calc(var(--topbar-h) + 16px)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>THE COMPANY INTELLIGENCE · EXECUTIVE WAR ROOM</p>
        <h1 className="home-band-title" style={{ fontSize: 28, color: 'var(--text-1)' }}>Hello, Ritesh.</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>5 strategic accounts · Organization intelligence · Updated today. Click any panel to open its full breakdown below.</p>
      </div>

      {/* Executive headline + threat gauge */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18, alignItems: 'stretch' }}>
        <div style={{ flex: '3 1 520px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#1c3155,#24406e)', color: '#fff', borderRadius: 'var(--radius-lg)', padding: '22px 24px 20px', border: '1px solid rgba(212,175,55,0.22)', boxShadow: '0 18px 42px rgba(13,26,46,0.16)' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.22, backgroundImage: 'radial-gradient(circle at 14px 14px, rgba(212,175,55,0.5) 1px, transparent 1.5px)', backgroundSize: '26px 26px' }} />
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)', marginBottom: 8 }}>Executive headline</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 1020 }}>
                {HEADLINE.map((h, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.58, color: 'rgba(255,255,255,0.94)' }}>
                    <span aria-hidden style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', marginTop: 9 }} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div style={{ flex: '1 1 260px' }}><Gauge onClick={() => scrollTo('det-radar')} /></div>
      </div>

      {/* KPI ROW: four-up executive highlight strip */}
      <div className="home-kpi-grid" style={{ marginBottom: 34 }}>
        <Kpi tone="red" num={String(TOTALS.criticalThreats)} icon={AlertTriangle} label="Critical Threats" desc="Requires attention" delta="↑ 2 vs yesterday" insight="GSK · Sanofi · AZ" meter={74} open={open} onViewDetail={() => scrollTo('det-changed')} popup={{
          what: '3 critical threats concentrated in GSK, Sanofi and AZ — up 2 since yesterday. Each is a convergence, not a single metric.',
          signals: [
            { module: 'Competition', text: 'Evinova (AstraZeneca/Accenture) consolidating the AZ digital-health mandate.' },
            { module: 'Relationship', text: 'Sanofi ExCo change (Jul 21) reopened the vendor list for ~90 days.' },
            { module: 'Delivery', text: 'AZ regulatory-portfolio CSAT slipping — $3.7M of that book exposed.' },
            { module: 'Sales & Growth', text: 'GSK digital/AI budget rising with no AI-led opportunity created yet.' },
          ],
          why: 'The three threats share one root: client-side AI and leadership shifts are moving faster than current engagement. Competitors reach the new decision-makers first.',
          ifNone: 'Windows close in sequence: Sanofi\'s 90-day vendor reset first, then AZ\'s hub mandate to Evinova. Once they close, no recovery play can be staged.',
          next: 'Deploy the Company executive sponsor to brief the AZ and Sanofi decision-makers on a bundled AI and delivery recovery roadmap this cycle.',
          outcome: 'Both accounts re-anchored to a Company-led AI agenda before renewal and vendor decisions are taken. Only one threat remains.',
          nbas: [
            {
              action: "Have the Company executive sponsor brief AZ's incoming country president on the AI transformation roadmap, leading with the regulatory-portfolio recovery.",
              actor: 'Company executive sponsor',
              target: "AZ's incoming country president",
              whyNow: "AZ's country-president succession and the Evinova hub move reset the shortlist inside a ~90-day window.",
              outcome: 'Company re-anchored to the AZ AI agenda before the hub mandate is set.',
            },
            {
              action: "Have the Company executive sponsor brief Sanofi's new ExCo owner on a bundled AI and delivery recovery roadmap before the committee locks its vendor set.",
              actor: 'Company executive sponsor',
              target: 'Sanofi new ExCo owner',
              whyNow: "Sanofi's ExCo change reopened the vendor list for ~90 days; no senior Company contact is mapped to the new owner yet.",
              outcome: 'Company on the re-formed shortlist before the reset window closes.',
            },
          ],
        }} />
        <Kpi tone="red" num={`$${TOTALS.revenueAtRisk}M`} icon={TrendingDown} label="Revenue at Risk" desc="Delivery and renewal exposure" delta={`↑ ${TOTALS.riskDeltaPct}% vs last 7 days`} insight="At-risk book" meter={68} open={open} onViewDetail={() => scrollTo('det-delivery')} popup={{
          what: `$${TOTALS.revenueAtRisk}M of the book is exposed — up ${TOTALS.riskDeltaPct}% in 7 days. Concentrated in AZ ($3.7M) and Novartis ($2.9M), not spread evenly.`,
          signals: [
            { module: 'Delivery', text: 'CSAT deterioration concentrated in one AZ service line (regulatory turnaround).' },
            { module: 'HR / Talent', text: 'Elevated attrition on the same delivery pods driving the CSAT slide.' },
            { module: 'Relationship', text: 'New client sponsor in place; no executive engagement logged in 90 days.' },
            { module: 'Competition', text: 'Competitor running GenAI workshops in the affected business unit pre-renewal.' },
          ],
          why: 'This is not a delivery issue alone. Delivery quality, talent instability, a relationship gap and competitor timing converge into combined renewal risk. Address it before renewal talks open.',
          ifNone: 'Renewal conversations begin with the incumbent relationship cold and a competitor already inside the affected unit. That is the hardest position from which to defend $12.4M.',
          next: 'Present the AZ sponsor a service-line recovery plan with a 30-day recovery metric before renewal planning starts, bringing HR in on the attrition contributor.',
          outcome: 'Renewal risk downgraded on the AZ and Novartis exposures. Sponsor re-engaged with a recovery metric agreed before the renewal window.',
          nbas: [
            {
              action: 'Have the AZ Account Executive and Delivery Leader present the new client sponsor a service-line recovery plan before renewal planning starts.',
              actor: 'AZ Account Executive + Delivery Leader',
              target: 'New AZ client sponsor',
              whyNow: 'Renewal talks open with the relationship cold and a competitor already inside the affected unit.',
              outcome: 'Recovery metric agreed with the sponsor before the renewal window opens.',
            },
            {
              action: 'Have HR stand up a retention plan on the delivery pods behind the CSAT slide, naming the attrition drivers and the stabilization moves.',
              actor: 'HR Business Partner + Delivery Leader',
              target: 'Affected AZ delivery pods',
              whyNow: 'Attrition on the same pods driving the CSAT slide will keep the recovery metric out of reach.',
              outcome: 'Attrition on the affected pods reduced so delivery quality and the recovery metric stabilize.',
            },
          ],
        }} />
        <Kpi tone="green" num={String(TOTALS.opportunities)} icon={Target} label="High-Value Opportunities" desc={`$${TOTALS.opportunityValue}M potential`} insight="Prioritize now" meter={82} open={open} onViewDetail={() => scrollTo('det-whitespace')} popup={{
          what: `${TOTALS.opportunities} whitespace opportunities, $${TOTALS.opportunityValue}M potential (value from source data). Strongest: GSK AI/R&D and J&J pipeline commercialization.`,
          signals: [
            { module: 'Market Intel', text: 'GSK $10.6bn Nuvalent acquisition + rising digital budget signal new commercialization demand.' },
            { module: 'Sales & Growth', text: 'No AI-led opportunity created at GSK despite the budget increase — penetration limited to existing lines.' },
            { module: 'Competition', text: 'IQVIA positioned on both sides of the OCE→Salesforce migration at the same accounts.' },
            { module: 'Relationship', text: 'GSK CSO and J&J commercial leadership are warm, un-engaged entry points on these programs.' },
          ],
          why: 'The whitespace exists because client investment is running ahead of current engagement. Budgets and pipeline milestones are landing in units where Company has no footprint and a competitor is already presenting.',
          next: 'Position the governed-AI play at GSK\'s CSO office before the budget lock and run the parallel J&J pipeline-commercialization motion.',
          outcome: 'Two P1 whitespace plays qualified into pipeline this quarter against the $8.7M. Competitor pre-empted at GSK Manufacturing and Commercial.',
          nbas: [
            {
              action: 'Position the governed-AI content and commercialization play to GSK\'s CSO office before the next budget lock.',
              actor: 'GSK account team + AI practice lead',
              target: 'GSK\'s CSO office',
              whyNow: 'The Nuvalent launch and rising digital budget land while no AI-led opportunity exists and a competitor is presenting.',
              outcome: 'A P1 GSK whitespace play qualified before the budget locks.',
            },
            {
              action: 'Run the parallel J&J pipeline-commercialization motion with commercial leadership, anchored on launch readiness.',
              actor: 'J&J account team',
              target: 'J&J commercial leadership',
              whyNow: 'J&J commercial relationships are warm but un-engaged and the pipeline is maturing into launch demand.',
              outcome: 'A P1 J&J commercialization play qualified alongside the GSK motion this quarter.',
            },
          ],
        }} />
        <Kpi tone="amber" num={String(TOTALS.execActions)} icon={Zap} label="Executive Actions" desc="Recommended this week" insight="2 owner moves" meter={56} open={open} onViewDetail={() => scrollTo('det-nba')} popup={{
          what: '2 executive actions this week, both relationship pivots triggered by leadership change — Sanofi\'s buying-committee reset and AZ\'s digital-health hub.',
          signals: [
            { module: 'Relationship', text: 'Sanofi ExCo change (Jul 21); AZ country-president succession underway.' },
            { module: 'Competition', text: 'Evinova (AZ/Accenture/AWS) moving to consolidate the AZ digital-health mandate.' },
            { module: 'Market Intel', text: 'New sponsors\' public priorities center on AI transformation and launch modernization.' },
            { module: 'Sales & Growth', text: 'No senior Company relationship mapped to either new decision-maker yet.' },
          ],
          why: 'Leadership changes reset both the vendor shortlist and the strategic agenda. The executive who reaches the new sponsor first with a credible AI proposition sets the frame for the next buying cycle.',
          ifNone: 'Evinova frames the AZ hub mandate and the Sanofi committee re-forms its shortlist without Company. Both happen inside the same ~90-day window.',
          outcome: 'A senior relationship established with each new decision-maker and Company on the shortlist before the 90-day window closes.',
          nbas: [
            {
              action: 'Request a strategy briefing with AZ\'s incoming country president within two weeks, leading with the AI transformation roadmap the new president has signaled publicly.',
              actor: 'Company executive sponsor',
              target: 'AZ incoming country president',
              whyNow: 'AZ\'s country-president succession and the Evinova-led digital-health hub reset the shortlist inside a ~90-day window.',
              outcome: 'AZ relationship re-anchored and Company on the shortlist before the hub mandate is set.',
            },
            {
              action: 'Request a strategy briefing with Sanofi\'s new ExCo owner within two weeks, leading with the AI and launch-modernization agenda the new owner has signaled publicly.',
              actor: 'Company executive sponsor',
              target: 'Sanofi new ExCo owner (buying-committee reset)',
              whyNow: 'Sanofi\'s ExCo change reopened the vendor list for ~90 days and no senior Company relationship is mapped to the new decision-maker yet.',
              outcome: 'Company placed on the re-formed shortlist before the buying committee locks its vendor set.',
            },
          ],
        }} />
      </div>

      {/* ============ BAND 1 · PORTFOLIO ANALYTICS ============ */}
      <BandHead n="01" title="Portfolio Analytics" sub="How the five accounts compare on threat, growth, concentration and opportunity." />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: '-6px 0 16px', padding: '7px 13px', borderRadius: 999, background: 'var(--gold-light)', border: '1px solid rgba(212,175,55,0.4)' }}>
        <span className="dot-clickable" style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>Click any glowing dot or cell to open its connected-intelligence breakdown.</span>
      </div>
      <div className="hg-3" style={{ marginBottom: 40 }}>
        <Panel title="Threat Radar" foot="Hover a dot for threat detail"><Radar onDot={(axis, v, tone) => open('Portfolio', axis, [chartEv(null, `${axis} · portfolio threat`, tone, radarPopup(axis, v))])} /></Panel>
        <Panel title="Client Growth vs Our Growth" foot="View the gap analysis" onOpen={() => scrollTo('det-clientgrowth')}><ClientVsOur onDot={a => { const gap = gapOf(a); open(a.name, `${a.name}: growth gap`, [chartEv(a.key, `${a.name} growth gap`, gap >= 5 ? 'red' : gap >= 2 ? 'amber' : 'green', clientGapPopup(a), { factBlock: [{ label: 'Client YoY', value: `+${a.clientGrowth}%` }, { label: 'Our YoY', value: `+${a.ourGrowth}%` }, { label: 'Gap', value: `${gap}%` }] })]) }} /></Panel>
        <Panel title="Revenue Concentration" foot="View concentration risk" onOpen={() => scrollTo('det-concentration')}><Concentration onRow={a => { const pct = CONCENTRATION.find(c => c.acc === a.key)!.pct; open(a.name, `${a.name} concentration`, [chartEv(a.key, `${a.name}: ${pct}% of portfolio`, pct >= 25 ? 'red' : 'amber', concentrationPopup(a, pct), { factBlock: [{ label: 'Share of portfolio', value: `${pct}%` }, { label: 'Combined AZ + GSK', value: '62%' }] })]) }} /></Panel>
        <Panel title="Growth × Whitespace Matrix" foot="Explore opportunities" onOpen={() => scrollTo('det-whitespace')}><Battlefield onBubble={a => open(a.name, `${a.name}: ${a.strat}`, [chartEv(a.key, `${a.name}: ${a.strat}`, a.color, battlefieldPopup(a), { factBlock: [{ label: 'Penetration', value: `${a.pen}%` }, { label: 'Opportunity score', value: `${a.opp_xy}%` }, { label: 'Value in play', value: `$${a.risk || a.opp}M` }, { label: 'Strategy', value: a.strat }] })])} /></Panel>
        <Panel title="Service-Line Opportunity Heatmap" foot="View service-line detail" onOpen={() => scrollTo('det-serviceline')}><Heatmap onCell={(acc, dim, tone) => open(ACC(acc).name, `${dim} · ${ACC(acc).name}`, [heatEv(acc, dim, tone)])} /></Panel>
        <Panel title="Early Warning · Threat Trajectory" foot="View trend detail" onOpen={() => scrollTo('det-radar')}><Early onRow={a => open(a.name, `${a.name}: trajectory`, [accountEv(a, `${a.name}: ${a.status}`, a.signal)])} /></Panel>
      </div>

      {/* ============ BAND 2 · SIGNALS, LEADERSHIP & DELIVERY ============ */}
      <BandHead n="02" title="Signals, Leadership & Delivery" sub="What changed, who moved, connected chains, and where delivery revenue is exposed." />
      <div className="hg-3" style={{ marginBottom: 40 }}>
        <Panel title="What Changed?" foot="View full timeline" onOpen={() => scrollTo('det-changed')}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }} onClick={e => e.stopPropagation()}>
            {['24H', '7D', '30D', 'QTR'].map(t => <button key={t} className={`pill-filter${t === tab ? ' active': ''}`} style={{ fontSize: 11, padding: '5px 11px' }} onClick={() => setTab(t)}>{t}</button>)}
          </div>
          <div onClick={e => e.stopPropagation()}>{CHANGES[tab].map((c, i) => <ChangeCard key={i} c={c} onClick={() => open(ACC(c.acc).name, c.title, [changeEv(c)])} />)}</div>
        </Panel>
        <Panel title="Connected Intelligence" foot="View full graph" onOpen={() => scrollTo('det-connected')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} onClick={e => e.stopPropagation()}>
            {CONNECTED_CHAINS.slice(0, 3).map((ch, i) => <Chain key={i} chain={ch} onClick={() => open(ACC(ch.acc).name, ch.nodes[0].t, [chainEv(ch)])} />)}
          </div>
        </Panel>
        <Panel title="Leadership & Relationship · Top 3" foot="View full leadership radar" onOpen={() => scrollTo('det-leadership')}><ExecMini onCard={e => open(ACC(e.acc).name, e.name, [execEv(e)])} /></Panel>
      </div>

      {/* ============ BAND 3 · FORECAST & ACTIONS ============ */}
      <BandHead n="03" title="Forecast & Actions" sub="Pipeline coverage, strategic bets, ranked whitespace, and the portfolio action queue." />
      <div className="hg-3" style={{ marginBottom: 16 }}>
        <Panel title="Pipeline: Next 3 Quarters" foot="View forecast detail" onOpen={() => scrollTo('det-pipeline')}><PipelineMini onRow={p => open(p.q, `${p.q} pipeline coverage`, [pipelineEv(p)])} /></Panel>
        <Panel title="Big Bets" foot="View big-bet lanes" onOpen={() => scrollTo('det-bigbets')}><BigBetsMini onRow={b => open(ACC(b.acc).name, b.title, [bigBetEv(b)])} /></Panel>
        <Panel title="White Space: Ranked" foot="View all opportunities" onOpen={() => scrollTo('det-whitespace')}><WhitespaceMini onRow={w => open(ACC(w.acc).name, `#${w.rank} ${ACC(w.acc).name}: ${w.title}`, [whitespaceEv(w)])} /></Panel>
      </div>
      <div style={{ marginBottom: 40 }}>
        <Panel title="Next Best Actions: Portfolio Queue" foot="View full queue" onOpen={() => scrollTo('det-nba')} wide><NbaList items={NBA_LIST.slice(0, 4)} onRow={n => open(ACC(n.acc).name, n.title, [nbaEv(n)])} /></Panel>
      </div>

      {/* ============ BAND 4 · ACCOUNT INTELLIGENCE (last: the per-account drill-in) ============ */}
      <BandHead n="04" title="Account Intelligence" sub="Signal → Connected Intelligence → Why It Matters → Next Best Action, per strategic account." />
      <div className="hg-3">
        {ACCOUNTS.map(a => (
          <Card key={a.key} className="home-panel" onClick={() => open(a.name, a.name, [accountEv(a, a.name, a.signal)])} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: '#1B365D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{a.short[0]}</span>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)' }}>{a.name}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6, background: CBG[a.color], color: CVAR[a.color] }}>{a.strat} {a.momentum}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{a.revenueLine} · {a.growth}</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.signal}</p>
            <div style={{ background: CBG[a.color], borderRadius: 6, padding: '7px 9px' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: CVAR[a.color], marginBottom: 2 }}>Why it matters</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{a.soWhat}</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#1B365D', marginTop: 'auto' }}>Signal → NBA <ArrowRight size={13} /></div>
          </Card>
        ))}
      </div>

      {/* ============ DETAILS ============ */}
      <div ref={detailRef} style={{ margin: '46px 0 26px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>Full breakdown: every panel, expanded</div>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Detail id="det-radar" idx="A" title="Threat & Opportunity Radar: Full Breakdown" sub="Eight portfolio threat dimensions and the 12-week trajectory per account.">
          <div className="hg-3">{[...ACCOUNTS].sort((a, b) => b.score - a.score).map(a => (
            <AccCard key={a.key} name={a.name} pill={`${a.score}/100 · ${a.status}`} tone={a.color} onClick={() => open(a.name, a.name, [accountEv(a, a.name, a.signal)])}>
              <div style={{ margin: '4px 0' }}><Spark vals={a.trend} color={CVAR[a.color]} w={220} h={40} /></div>
              <MLine k="Momentum" v={a.momentum} /><MLine k="12-wk change" v={`${a.trend[a.trend.length - 1] - a.trend[0] >= 0 ? '+': ''}${a.trend[a.trend.length - 1] - a.trend[0]} pts`} /><MLine k="Strategy" v={a.strat} />
            </AccCard>))}</div>
        </Detail>

        <Detail id="det-clientgrowth" idx="B" title="Client Growth vs Our Growth" sub="Where account revenue is under-indexing client momentum: the wallet-share read.">
          <div className="hg-3">{ACCOUNTS.map(a => { const gap = gapOf(a); return (
            <AccCard key={a.key} name={a.name} pill={gap >= 5 ? 'WALLET LOSS RISK': gap >= 2 ? 'KEEP PACE': 'TRACKING CLOSELY'} tone={gap >= 5 ? 'red': gap >= 2 ? 'amber': 'green'} onClick={() => open(a.name, `${a.name} growth gap`, [ev(a.key, `${a.name} growth gap`, `Client YoY +${a.clientGrowth}% vs our +${a.ourGrowth}%: ${gap}% gap.`, gap >= 5 ? 'red': gap >= 2 ? 'amber': 'green', { factBlock: [{ label: 'Client YoY', value: `+${a.clientGrowth}%` }, { label: 'Our YoY', value: `+${a.ourGrowth}%` }, { label: 'Gap', value: `${gap}%` }], next_best_action: GROWTH_GAP_NBA[a.key] })])}>
              <MLine k="Client YoY" v={`+${a.clientGrowth}%`} /><MLine k="Our YoY" v={`+${a.ourGrowth}%`} vColor={gap >= 5 ? 'var(--red)': undefined} /><MLine k="Gap" v={`${gap}%`} vColor={gap >= 5 ? 'var(--red)': 'var(--text-1)'} />
            </AccCard>)})}</div>
        </Detail>

        <Detail id="det-concentration" idx="C" title="Revenue Concentration Risk" sub="62% of portfolio revenue sits in AstraZeneca + GSK: growth increasingly depends on two accounts.">
          <div className="hg-3">{CONCENTRATION.map(c => { const a = ACC(c.acc); return (
            <AccCard key={c.acc} name={a.name} pill={`${c.pct}%`} tone={c.pct >= 25 ? 'red': c.pct >= 15 ? 'amber': 'green'} onClick={() => open(a.name, `${a.name} concentration`, [ev(c.acc, `${a.name}: ${c.pct}% of portfolio`, 'Accelerate whitespace conversion in Sanofi, Novartis and J&J to reduce two-account dependency.', c.pct >= 25 ? 'red': 'amber', { factBlock: [{ label: 'Share of portfolio', value: `${c.pct}%` }, { label: 'Combined AZ + GSK', value: '62%' }], next_best_action: 'Convert Sanofi, Novartis and J&J whitespace (ExCo window, launch support, pipeline demand) to dilute the 62% AZ + GSK concentration before it becomes structural.' })])}>
              <div style={{ height: 8, borderRadius: 5, background: 'var(--navy-faint)', overflow: 'hidden', margin: '6px 0' }}><div style={{ width: `${c.pct * 2.5}%`, height: '100%', background: CVAR[c.pct >= 25 ? 'red': c.pct >= 15 ? 'amber': 'green'] }} /></div>
              <MLine k="Share of portfolio" v={`${c.pct}%`} />
            </AccCard>)})}</div>
        </Detail>

        <Detail id="det-whitespace" idx="D" title="White Space Opportunities: Ranked" sub="Ranked by potential, not alphabetically: with why-now evidence and next move.">
          <div className="hg-2">{WHITESPACE.map(w => { const a = ACC(w.acc); return (
            <AccCard key={w.rank} name={`#${w.rank} ${a.name}`} pill={w.conf} tone={w.conf === 'High' ? 'green': 'amber'} onClick={() => open(a.name, `#${w.rank} ${a.name}: ${w.title}`, [whitespaceEv(w)])}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{w.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{w.why}</div>
            </AccCard>)})}</div>
        </Detail>

        <Detail id="det-serviceline" idx="E" title="Service-Line Opportunity Heatmap" sub="Rows = accounts, columns = service lines. Cell = footprint / growth / whitespace / competitive risk.">
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead><tr><th style={thL}>Account</th>{HEATCOLS.map(c => <th key={c} style={thC}>{c}</th>)}</tr></thead>
            <tbody>{ACCOUNTS.map(a => (<tr key={a.key}><td style={{ padding: '9px 6px', color: 'var(--text-1)', fontWeight: 600 }}>{a.name}</td>{HEATCOLS.map(c => { const t = HEATDATA[a.key][c]; return <td key={c} style={{ textAlign: 'center', padding: '9px 6px' }}><DotTip label={`${c} · ${a.name}`} icon={<Target size={15} color="var(--navy)" />} popup={heatPopup(a.key, c, t)}><span className="dot-clickable" onClick={() => open(a.name, `${c} · ${a.name}`, [heatEv(a.key, c, t)])} style={{ width: 15, height: 15, borderRadius: '50%', display: 'inline-block', background: CVAR[t], cursor: 'pointer' }} /></DotTip></td> })}</tr>))}</tbody>
          </table></div>
        </Detail>

        <Detail id="det-changed" idx="F" title="What Changed: Full Timeline" sub="Every tracked change across all five accounts and four time windows.">
          {['24H', '7D', '30D', 'QTR'].map(t => (<div key={t} style={{ marginBottom: 14 }}><div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 8 }}>{t}</div>{CHANGES[t].map((c, i) => <ChangeCard key={i} c={c} onClick={() => open(ACC(c.acc).name, c.title, [changeEv(c)])} />)}</div>))}
        </Detail>

        <Detail id="det-connected" idx="G" title="Connected Intelligence: Full Graph" sub="The signature of Company: one correlation chain per strategic account, from external signal to opportunity.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{CONNECTED_CHAINS.map((ch, i) => (
            <Chain key={i} chain={ch} onClick={() => open(ACC(ch.acc).name, ch.nodes[0].t, [chainEv(ch)])} />
          ))}</div>
        </Detail>

        <Detail id="det-leadership" idx="H" title="Leadership & Relationship Intelligence" sub="Executive → change → priority → influence → recommended engagement, per account.">
          <div className="hg-3">{EXEC_MOVES.map(e => (
            <div key={e.name} className="card home-panel" onClick={() => open(ACC(e.acc).name, e.name, [execEv(e)])} style={{ background: 'var(--bg-raised)', padding: '16px 18px', width: '100%' }}>
              <div style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 10 }}>
                <Avatar name={e.name} size={44} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.title} · {ACC(e.acc).short}</div>
                </div>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: CVAR[e.signal], flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{e.focus}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'var(--navy-faint)', color: 'var(--navy)' }}>Relationship: {e.relationship}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'var(--gold-light)', color: 'var(--gold-muted)' }}>Influence: {e.influence}</span>
              </div>
            </div>))}</div>
        </Detail>

        <Detail id="det-delivery" idx="I" title="Delivery & Revenue at Risk" sub="CSAT → project health → renewal probability → revenue exposure.">
          <div className="hg-2">{ACCOUNTS.filter(a => a.risk > 0).map(a => (
            <AccCard key={a.key} name={a.name} pill={`$${a.risk}M at risk`} tone={a.risk >= 3 ? 'red': 'amber'} onClick={() => open(a.name, `${a.name}: delivery risk`, [ev(a.key, `${a.name}: delivery risk`, `$${a.risk}M revenue exposed. Executive sponsor review recommended before renewal decisions.`, a.risk >= 3 ? 'red': 'amber', { factBlock: [{ label: 'Revenue at risk', value: `$${a.risk}M` }, { label: 'Threat score', value: `${a.score}/100` }, { label: 'Momentum', value: a.momentum }], ai_hypothesis: 'CSAT and project-health trends are the leading indicators: this is a lagging revenue figure.', next_best_action: 'Executive sponsor review for deteriorating projects before renewal decisions.' })])}>
              <MLine k="Revenue at risk" v={`$${a.risk}M`} vColor="var(--red)" /><MLine k="Threat score" v={`${a.score}/100`} /><MLine k="Momentum" v={a.momentum} />
            </AccCard>))}</div>
        </Detail>

        <Detail id="det-pipeline" idx="J" title="Pipeline: Next Three Quarters" sub="Committed / best case / at risk vs target. Q3 covered; Q4-Q1 coverage insufficient.">
          <div className="hg-3">{PIPELINE.map(p => (
            <AccCard key={p.q} name={p.q} pill={`${p.pct}% of target`} tone={p.pct >= 85 ? 'green': p.pct >= 65 ? 'amber': 'red'} onClick={() => open(p.q, `${p.q} pipeline coverage`, [pipelineEv(p)])}>
              <div style={{ height: 8, borderRadius: 5, background: 'var(--navy-faint)', overflow: 'hidden', margin: '6px 0' }}><div style={{ width: `${p.pct}%`, height: '100%', background: CVAR[p.pct >= 85 ? 'green': p.pct >= 65 ? 'amber': 'red'] }} /></div>
              <MLine k="Committed" v={`$${p.committed}M`} /><MLine k="Best case" v={`$${p.best}M`} /><MLine k="At risk" v={`$${p.risk}M`} vColor="var(--red)" />
            </AccCard>))}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 12 }}>Current pipeline supports the Q3 target, but Q4/Q1 coverage is insufficient: prioritize whitespace capable of closing the Q4 gap.</div>
        </Detail>

        <Detail id="det-bigbets" idx="K" title="Big Bets: Progress Lanes" sub="Hypothesis → Relationship → Discovery → Proposal → Pilot → Revenue.">
          {BIG_BETS.map(b => { const stageIdx = BET_STAGES.indexOf(b.stage); return (
            <div key={b.title} className="home-glow" onClick={() => open(ACC(b.acc).name, b.title, [bigBetEv(b)])} style={{ padding: '12px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{b.title}</span><span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Started {b.started} · {b.progress}%</span></div>
              <div style={{ display: 'flex', gap: 4 }}>{BET_STAGES.map((s, i) => (<div key={s} style={{ flex: 1, textAlign: 'center' }}><div style={{ height: 5, borderRadius: 3, background: i <= stageIdx ? CVAR[b.progress < 20 ? 'red': b.progress < 60 ? 'amber': 'green']: 'var(--navy-faint)' }} /><div style={{ fontSize: 9, color: i === stageIdx ? 'var(--text-1)': 'var(--text-3)', marginTop: 4 }}>{s}</div></div>))}</div>
            </div>)})}
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 12 }}>2 of 4 strategic bets show limited movement despite &gt;2 quarters elapsed: escalate stalled bets to executive owners.</div>
        </Detail>

        <Detail id="det-nba" idx="L" title="Next Best Actions: Full Queue" sub="Ranked P1 NOW / P2 THIS QUARTER / P3 WATCH, each with why-now and evidence.">
          <NbaList items={NBA_LIST} onRow={n => open(ACC(n.acc).name, n.title, [nbaEv(n)])} />
        </Detail>
      </div>

      {/* Back-to-top: always visible on the right so users can return after jumping to a section */}
      <button onClick={backToTop} aria-label="Back to top"
        style={{
          position: 'fixed', right: 28, bottom: 96, width: 46, height: 46, borderRadius: '50%',
          background: 'linear-gradient(150deg,#24406e,#1B365D)', color: 'var(--gold)', border: '1.5px solid var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 900,
          boxShadow: '0 0 0 1px var(--gold), 0 0 18px rgba(212,175,55,0.5), 0 10px 26px rgba(13,26,46,0.35)',
          opacity: 1, transform: 'translateY(0)', pointerEvents: 'auto', transition: 'transform 260ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--gold), 0 0 24px rgba(212,175,55,0.8), 0 12px 30px rgba(13,26,46,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 0 1px var(--gold), 0 0 18px rgba(212,175,55,0.5), 0 10px 26px rgba(13,26,46,0.35)' }}>
        <ArrowUp size={20} strokeWidth={2.4} />
      </button>

      <EvidenceDrawer stack={stack} onClose={() => setStack([])} onBack={() => setStack(s => s.slice(0, -1))} />
    </div>
  )
}

/* ================= EVIDENCE BUILDERS (rich, multi-field, per data type) ================= */
function changeEv(c: Change): EvidenceItem {
  const tone: Tone = c.tag === 'critical' ? 'red': 'green'
  const a = ACC(c.acc)
  const risk = c.tag === 'critical'
  return ev(c.acc, c.title, c.body, tone, {
    categoryLabel: c.cat, dateISO: c.time, confidence: 'High', priority: risk ? 'High' : 'Medium',
    connectedModules: ciFor(c.acc),
    factBlock: [{ label: 'Category', value: c.cat }, { label: 'Impact', value: c.impact }, { label: 'Value', value: c.val }],
    so_what: c.impact,
    if_no_action: risk
      ? `${a.name}: the ${c.cat.toLowerCase()} signal compounds — ${c.val} of exposure hardens before the account team re-engages.`
      : `${a.name}: the ${c.val} window narrows as a competitor or internal team moves on the same opening first.`,
    nbas: [{ action: c.nba, actor: 'Account Executive + relevant service-line lead', target: `${a.name} decision-makers`, whyNow: `Signal is ${c.time}; ${c.impact.toLowerCase()} — the window is live now.`, outcome: risk ? `${c.val} exposure contained before it converts to lost revenue.` : `${c.val} opening qualified into pipeline before it closes.` }],
    expected_outcome: risk ? `${a.name} exposure downgraded and the account re-engaged before renewal/vendor decisions.` : `A named ${a.name} opportunity created against the ${c.val} signal.`,
  })
}
function chainEv(ch: ChainDef): EvidenceItem {
  const a = ACC(ch.acc)
  return ev(ch.acc, ch.nodes[0].t, ch.nodes.map(n => n.t + (n.v ? ` (${n.v})`: '')).join('  →  '), ch.nodes[ch.nodes.length - 1].c, {
    categoryLabel: 'Connected Intelligence', confidence: ch.confidence >= 80 ? 'High': ch.confidence >= 65 ? 'Medium': 'Low',
    priority: ch.confidence >= 80 ? 'High' : 'Medium',
    connectedModules: [
      ...ch.nodes.filter(n => n.v).map(n => ({ module: 'Signal', signal: `${n.t} — ${n.v}` })),
      ...ciFor(ch.acc).slice(0, 2),
    ],
    factBlock: ch.nodes.map(n => ({ label: n.t, value: n.v || ':' })),
    ai_hypothesis: ch.hypothesis, so_what: `Multiple signals converge on one interpretation (confidence ${ch.confidence}%), not a single metric.`,
    if_no_action: `${a.name}: the chain resolves the wrong way — the ${ch.nodes[ch.nodes.length - 1].t.toLowerCase()} accrues to whoever engages first.`,
    nbas: [{ action: ch.nba, actor: 'Account Executive + Company executive sponsor', target: `${a.name} leadership`, whyNow: `The converging signals are live now (confidence ${ch.confidence}%).`, outcome: `${ch.nodes[ch.nodes.length - 1].t} secured for Company before a competitor closes it.` }],
    expected_outcome: `The converging chain turned into an owned Company position at ${a.name}.`,
  })
}
function execEv(e: Exec): EvidenceItem {
  const a = ACC(e.acc)
  return ev(e.acc, `${e.name}: ${e.title}`, e.focus, e.signal, {
    kind: 'executive', who: { name: e.name, role: e.title }, categoryLabel: 'Leadership Intelligence',
    priority: e.relationship === 'Weak' ? 'High' : 'Medium',
    connectedModules: ciFor(e.acc),
    factBlock: [{ label: 'Relationship', value: e.relationship }, { label: 'Buying influence', value: e.influence }],
    so_what: e.context,
    if_no_action: `${e.name} sets the agenda with whoever reaches them first; a ${e.relationship.toLowerCase()} relationship at ${e.influence.toLowerCase()} influence leaves the account exposed if a competitor engages first.`,
    nbas: [{ action: e.engagement, actor: 'Company executive sponsor', target: `${e.name} (${e.title}), ${a.name}`, whyNow: `${e.signal === 'red' ? 'Relationship is weak and the window is open now' : 'Priorities are being set now'} — first credible proposition frames the buying cycle.`, outcome: `Relationship strengthened from ${e.relationship} and Company anchored to ${e.name}'s agenda.` }],
    expected_outcome: `A senior relationship established with ${e.name} before the current priority window closes.`,
  })
}
function whitespaceEv(w: typeof WHITESPACE[number]): EvidenceItem {
  const a = ACC(w.acc)
  return ev(w.acc, `${a.name}: ${w.title}`, w.why, 'green', {
    categoryLabel: 'White Space', confidence: w.conf as any, priority: w.rank <= 2 ? 'High' : 'Medium',
    connectedModules: ciFor(w.acc),
    factBlock: [{ label: 'Confidence', value: w.conf }, { label: 'Ease of entry', value: `${w.ease}/100` }, { label: 'Opportunity value', value: `${w.value}/100` }],
    so_what: `${a.name} is generating demand for "${w.title}" that maps onto Company service lines but is not yet owned by any vendor.`,
    if_no_action: `A competitor anchors "${w.title}" at ${a.name} first while ease-of-entry (${w.ease}/100) is still favorable.`,
    nbas: [{ action: w.next, actor: 'Account Executive + service-line lead', target: `${a.name} program owner for ${w.title}`, whyNow: `${w.conf} confidence, opportunity value ${w.value}/100 — the first-mover window is open.`, outcome: `"${w.title}" qualified into pipeline before a competitor claims it.` }],
    expected_outcome: `"${w.title}" converted from whitespace into a named, owned pursuit at ${a.name}.`,
    evidence_gaps: 'Opportunity value shown as a 0–100 score, not a booking forecast; dollar value not established from available evidence.',
  })
}
function bigBetEv(b: typeof BIG_BETS[number]): EvidenceItem {
  const a = ACC(b.acc)
  const tone: Tone = b.progress < 20 ? 'red': b.progress < 60 ? 'amber': 'green'
  const nba = b.progress < 20
    ? `Have the Company executive sponsor put the "${b.title}" milestone plan in front of ${a.name}'s decision-maker with a named next proof point and date — the bet is stalled at ${b.progress}% and the engagement window is closing.`
    : b.progress < 60
    ? `Confirm the next milestone owner and date for "${b.title}" with ${a.name}, tying it to the revenue-conversion trigger — momentum is real (${b.progress}%) but unprotected.`
    : `Lock the revenue-conversion date for "${b.title}" with ${a.name} before the ${b.stage.toLowerCase()} stage cools — this is the portfolio's highest-progress bet.`
  return ev(b.acc, b.title, `Started ${b.started}. Stage: ${b.stage}. Progress ${b.progress}%.`, tone, {
    categoryLabel: 'Big Bets', priority: b.progress < 20 ? 'High' : 'Medium',
    connectedModules: ciFor(b.acc),
    factBlock: [{ label: 'Started', value: b.started }, { label: 'Stage', value: b.stage }, { label: 'Progress', value: `${b.progress}%` }],
    so_what: b.note,
    if_no_action: b.progress < 20 ? `"${b.title}" stays stuck at ${b.stage.toLowerCase()} and the ${a.name} window closes with no commercial movement.` : `Momentum on "${b.title}" leaks as the next milestone drifts without an owner or date.`,
    nbas: [{ action: nba, actor: 'Company executive sponsor / bet owner', target: `${a.name} decision-maker`, whyNow: `Bet is at ${b.progress}% (${b.stage}); the window is live now.`, outcome: `"${b.title}" advanced past ${b.stage} toward revenue conversion.` }],
    expected_outcome: `"${b.title}" moved to the next stage with a named owner and date at ${a.name}.`,
  })
}
function heatEv(acc: string, dim: string, tone: RAG): EvidenceItem {
  const a = ACC(acc)
  if (acc === 'gsk' && dim === 'Data & AI') {
    return ev(acc, `${dim}: ${a.name}`, 'GSK is explicitly using AI in drug discovery through a collaboration combining human cellular datasets with AI models for target discovery.', tone, {
      categoryLabel: 'Service-Line Opportunity', confidence: 'High', priority: 'High',
      connectedModules: ciFor('gsk'),
      factBlock: [{ label: 'Client investment', value: 'Increasing' }, { label: 'Existing penetration', value: 'Low' }, { label: 'Competition', value: 'Rising' }, { label: 'Opportunity score', value: '87/100' }],
      evidence: 'Relation Therapeutics AI collaboration',
      so_what: 'Rising client AI investment against low Company penetration is a direct whitespace, not a threat — if we move before competitors own the capability.',
      if_no_action: 'Competitor AI/R&D activity consolidates the Data & AI capability at GSK before Company establishes an R&D executive entry.',
      nbas: [{ action: 'Run an executive AI/R&D discovery workshop with GSK\'s R&D leadership, anchored on target-discovery use cases and a governed-AI reference.', actor: 'Company executive sponsor + AI/R&D practice lead', target: 'GSK R&D / Data & AI leadership', whyNow: 'Client investment is increasing and penetration is low — the ownership window is open now.', outcome: 'An R&D executive entry established before competitors own the Data & AI mandate.' }],
      expected_outcome: 'Company positioned on GSK Data & AI with a qualified R&D engagement path.',
    })
  }
  const score = tone === 'red' ? 72: tone === 'amber' ? 55: 32
  const signal = tone === 'red' ? 'Competitive risk': tone === 'amber' ? 'Growth': 'Strong footprint'
  const nba = tone === 'red'
    ? `Have the account team engage ${a.short}'s ${dim} owners with a capability proof point before ownership consolidates around a competitor.`
    : tone === 'amber'
    ? `Track ${a.short} ${dim} investment and bring a proof point to the sponsor the moment budget is committed — early-stage but rising.`
    : `Maintain the ${dim} footprint at ${a.short}; low near-term risk, no active intervention needed.`
  return ev(acc, `${dim}: ${a.name}`, `${dim} on ${a.name} is rated ${tone.toUpperCase()}.`, tone, {
    categoryLabel: 'Service-Line Opportunity', priority: tone === 'red' ? 'High' : 'Medium',
    connectedModules: ciFor(acc),
    factBlock: [{ label: 'Opportunity score', value: `${score}/100` }, { label: 'Signal', value: signal }],
    so_what: `${dim} on ${a.name} reads as ${signal.toLowerCase()} once client investment, penetration and competitor activity are read together.`,
    if_no_action: tone === 'red' ? `A competitor consolidates ${dim} ownership at ${a.name} before Company engages.` : undefined,
    nbas: [{ action: nba, actor: 'Account team + service-line lead', target: `${a.name} ${dim} owners`, whyNow: `${dim} rated ${tone.toUpperCase()} (${signal}) now.`, outcome: tone === 'red' ? `${dim} defended before competitor consolidation.` : `${dim} opportunity readiness maintained.` }],
  })
}
function pipelineEv(p: typeof PIPELINE[number]): EvidenceItem {
  const tone: Tone = p.pct >= 85 ? 'green': p.pct >= 65 ? 'amber': 'red'
  const nba = p.q === 'Q4'
    ? 'Assign each of the four ranked whitespace opportunities a close plan and date this week to close the Q4 coverage gap.'
    : p.pct < 65
    ? 'Accelerate qualification on the early-stage opportunities feeding this quarter, with the AE converting best-case to committed before quarter close.'
    : 'Protect the committed deals through close; hold weekly close-plan reviews on the at-risk portion.'
  return ev(null, `${p.q} pipeline coverage`, `${p.pct}% of target covered by committed + best-case pipeline.`, tone, {
    categoryLabel: 'Pipeline', priority: p.pct < 65 ? 'High' : 'Medium',
    connectedModules: [
      { module: 'Sales & Growth', signal: `${p.q}: $${p.committed}M committed + $${p.best}M best-case vs target (${p.pct}% covered).` },
      { module: 'Delivery', signal: `$${p.risk}M of ${p.q} pipeline sits in the at-risk band.` },
      ...ciFor(null).slice(2, 4),
    ],
    factBlock: [{ label: 'Committed', value: `$${p.committed}M` }, { label: 'Best case', value: `$${p.best}M` }, { label: 'At risk', value: `$${p.risk}M` }, { label: 'Coverage', value: `${p.pct}% of target` }],
    so_what: p.pct < 65 ? `Coverage gap: committed + best-case falls short of the ${p.q} target, so pipeline creation — not just close — is required.` : `On track to cover the ${p.q} target if committed deals are protected.`,
    if_no_action: p.pct < 65 ? `${p.q} closes under target with $${p.risk}M unrecovered and no time to create replacement pipeline.` : undefined,
    nbas: [{ action: nba, actor: 'Account Executive + pipeline owner', target: `${p.q} opportunity set`, whyNow: `${p.q} is at ${p.pct}% coverage now; creation lead-time is running out.`, outcome: `${p.q} coverage lifted toward target with the $${p.risk}M at-risk band addressed.` }],
    expected_outcome: `${p.q} coverage moved toward target; at-risk pipeline resolved before quarter close.`,
  })
}
function nbaEv(n: Nba): EvidenceItem {
  const a = ACC(n.acc)
  return ev(n.acc, n.title, n.why, n.color, {
    categoryLabel: 'Next Best Action', priority: n.prio === 'P1' ? 'High' : n.prio === 'P2' ? 'Medium' : 'Low',
    who: { name: n.owner, role: 'Owner' },
    connectedModules: ciFor(n.acc),
    factBlock: [{ label: 'Priority', value: n.prio }, { label: 'Impact', value: n.impact }, { label: 'Owner', value: n.owner }],
    so_what: n.why,
    nbas: [{ action: n.title, actor: n.owner === 'Unassigned' ? 'Account team (owner to be named)' : n.owner, target: `${a.name} leadership`, whyNow: `${n.prio} · ${n.impact} — ${n.why}`, outcome: `${n.impact} outcome realized for ${a.name}.` }],
    expected_outcome: `${a.name}: ${n.impact.toLowerCase()} outcome moved forward under a named owner.`,
  })
}

const thL: React.CSSProperties = { textAlign: 'left', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', padding: '4px 6px' }
const thC: React.CSSProperties = { textAlign: 'center', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', padding: '4px 6px' }

/* ================= LAYOUT SHELLS ================= */
function BandHead({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-muted)' }}>{n}</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>{title}</h2>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '4px 0 0 26px' }}>{sub}</p>
    </div>
  )
}
function Panel({ title, foot, onOpen, children, wide }: { title: string; foot: string; onOpen?: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <Card onClick={onOpen} className="home-panel" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: wide ? undefined: 300 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <span style={{ width: 15, height: 15, borderRadius: '50%', border: '1px solid var(--text-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--text-3)' }}>i</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--text-1)', textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
      <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>{foot} <ArrowRight size={13} /></div>
    </Card>
  )
}
interface PopupData { what: string; why: string; next?: string; signals?: { module: string; text: string }[]; outcome?: string; ifNone?: string; nbas?: { action: string; actor?: string; target?: string; whyNow?: string; outcome?: string }[] }
function SignalPopover({ label, icon, what, why, next, signals, outcome, ifNone, x, y, onMouseEnter, onMouseLeave }: PopupData & { label: string; icon: React.ReactNode; x: number; y: number; onMouseEnter: () => void; onMouseLeave: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const wide = !!(signals && signals.length)
  const w = wide ? 360 : 300
  const [sz, setSz] = useState({ w, h: 220 })
  useLayoutEffect(() => {
    const el = ref.current
    if (el) setSz({ w: el.offsetWidth, h: el.offsetHeight })
  }, [])
  const pad = 12
  let nx = x + 18, ny = y + 18
  if (nx + sz.w > window.innerWidth - pad) nx = Math.max(pad, x - sz.w - 18)
  if (ny + sz.h > window.innerHeight - pad) ny = Math.max(pad, y - sz.h - 18)
  return (
    <motion.div ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 8 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', left: nx, top: ny,
        width: w, zIndex: 1200, textAlign: 'left',
        background: '#ffffff', borderRadius: 14, padding: '14px 16px 15px',
        border: '1px solid rgba(212,175,55,0.45)',
        boxShadow: '0 18px 44px rgba(13,26,46,0.28)',
        maxHeight: '80vh', overflowY: 'auto',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 9, borderBottom: '1px solid var(--border)' }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--navy-faint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 2 }}>Signal</div>
        <Bullets items={what} compact />
      </div>
      {wide && (
        <div style={{ marginBottom: 8, border: '1px solid var(--navy-faint)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--navy)', background: 'var(--navy-faint)', padding: '5px 9px' }}>Connected signals · {signals!.length} modules</div>
          {signals!.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 9px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              <span style={{ flexShrink: 0, minWidth: 74, fontSize: 9, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--navy)', paddingTop: 1 }}>{s.module}</span>
              <span style={{ fontSize: 11, color: 'var(--text-1)', lineHeight: 1.45 }}>{s.text}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 2 }}>Why it matters</div>
        <Bullets items={why} compact />
      </div>
      {ifNone && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 2 }}>If no action is taken</div>
          <Bullets items={ifNone} compact />
        </div>
      )}
      <div style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--navy)', marginBottom: 2 }}>Next best action</div>
        <Bullets items={next ?? ''} compact />
      </div>
      {outcome && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 2 }}>Expected outcome</div>
          <Bullets items={outcome} compact />
        </div>
      )}
    </motion.div>
  )
}
function useCardPopup() {
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const leaveTimer = useRef<number | null>(null)
  const enter = () => { if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null } setHover(true) }
  const leave = () => { leaveTimer.current = window.setTimeout(() => setHover(false), 150) }
  const move = (e: React.MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }) }
  return { hover, enter, leave, move, pos }
}
// Chart dots/bubbles: hover data-display REMOVED (product spec). Dots are click-
// only now — the glow (.dot-clickable) signals clickability and the click opens the
// Connected-Intelligence drawer. These stay as thin passthrough wrappers so the
// existing call sites (label/icon/popup props) keep compiling.
function DotTip({ children }: { label: string; icon: React.ReactNode; popup: PopupData; children: React.ReactNode }) {
  return <span style={{ display: 'contents' }}>{children}</span>
}
function SvgDotTip({ children }: { label: string; icon: React.ReactNode; popup: PopupData; children: React.ReactNode }) {
  return <g style={{ cursor: 'pointer' }}>{children}</g>
}
interface RadarIntel { what: string; why: string; ifNone?: string; next: string; outcome: string }
const RADAR_INTEL: Record<string, RadarIntel> = {
  'Competition': {
    what: 'Competition scores 88/100 — a Critical portfolio threat. Competitors are consolidating the contested mandates: Evinova\'s Accenture/AWS partnership is securing AZ\'s digital-health hub. Rival AI/R&D players are moving on GSK alongside its +42% AI spend.',
    why: 'Both contested capabilities are low-penetration whitespace: first-mover ownership will lock out Company.',
    ifNone: 'Evinova\'s Accenture/AWS partnership owns AZ\'s digital-health mandate and GSK\'s AI capability consolidates with a competitor before Company establishes any entry.',
    next: 'Engage AZ\'s incoming hub sponsor with an AI-enabled development proposition. Run a GSK R&D discovery workshop before Evinova and GSK\'s AI partners lock the mandate.',
    outcome: 'Company holds a named entry in both contested capabilities before competitor ownership locks.',
  },
  'AI Disruption': {
    what: 'AI Disruption scores 82/100 — a Critical portfolio threat. Client-side AI is becoming an operating capability: GSK is spending +42% on AI with Relation Therapeutics. Sanofi is reorganized as an AI-powered biopharma.',
    why: 'AI-led clients are pulling scientific, clinical and commercial work in-house, shrinking demand for manual services.',
    ifNone: 'GSK and Sanofi stand up in-house AI while Company\'s manual-service scope erodes and the governed-AI window closes.',
    next: 'Pitch GSK\'s R&D leadership a governed-AI target-discovery offer and Sanofi\'s new ExCo an AI-enabled development engagement. Both land before internal teams build the capability in-house.',
    outcome: 'Company\'s governed-AI offers replace manual scope before internal AI build-out closes the window.',
  },
  'Client Insourcing': {
    what: 'Client Insourcing scores 78/100 — a Critical portfolio threat. Novartis is running a client-insourcing pilot in one service line while bolt-on M&A adds assets faster than launch infrastructure.',
    why: 'The pilot historically precedes vendor consolidation: the acquired-assets launch gap is Company\'s entry or its retention risk.',
    ifNone: 'Novartis\'s pilot consolidates into a broader in-house build while its acquired assets launch without Company support.',
    next: 'Propose an integration-support engagement to Novartis covering launch and commercialization of bolt-on M&A assets. Do it before the insourcing pilot scales.',
    outcome: 'Novartis integration-support scope is won before the pilot scales.',
  },
  'Delivery': {
    what: 'Delivery scores 58/100 — an Elevated portfolio threat. Two AZ regulatory programs show a delivery-score decline and CSAT drop, exposing $3.7M of renewal and expansion revenue.',
    why: 'CSAT and project-health trends are the leading indicators: the $3.7M exposure converts unless the delivery slide is corrected before renewal.',
    ifNone: 'The two AZ programs keep sliding and the $3.7M renewal exposure converts to lost revenue at the Q4 decision.',
    next: 'Run an executive-sponsor recovery review on the two AZ regulatory programs this week. Name an owner and set a proof point before the Q4 renewal decision.',
    outcome: 'AZ delivery recovered and the $3.7M renewal protected at the Q4 decision.',
  },
  'Revenue': {
    what: 'Revenue scores 55/100 — an Elevated portfolio threat. Q4 coverage is insufficient: the $3.7M AZ and $2.9M Novartis exposures sit at risk while committed plus best-case pipeline falls short of target.',
    why: 'Both exposures land in the same renewal window: AZ recovery and Novartis launch-scope conversion are the largest Q4 levers.',
    ifNone: 'Q4 closes under target with the $3.7M AZ and $2.9M Novartis exposures unrecovered and no time to create replacement pipeline.',
    next: 'Assign each of the four ranked whitespace opportunities a close plan and date. Prioritize the AZ $3.7M and Novartis $2.9M recoveries this week.',
    outcome: 'Q4 coverage lifted toward target with the two largest exposures resolved.',
  },
  'Leadership': {
    what: 'Leadership scores 48/100 — a Moderate portfolio threat. Buying committees are resetting: Sanofi\'s Jul-21 ExCo change reopened the vendor list for ~90 days. AZ\'s country-president succession is standing up a digital-health hub.',
    why: 'Relationships anchored to the old committee, so the reset is a 90-day re-entry window, not a permanent loss.',
    ifNone: 'Sanofi\'s re-formed shortlist and AZ\'s new hub mandate consolidate without Company because relationships stayed anchored to the old committee.',
    next: 'Brief Sanofi\'s new ExCo owner on the AI and launch-modernization agenda. Engage AZ\'s incoming hub sponsor before their shortlists lock.',
    outcome: 'Company placed on Sanofi\'s re-formed shortlist and AZ\'s new hub vendor set.',
  },
  'Market': {
    what: 'Market scores 35/100 — a Moderate portfolio threat. Launch and commercialization budgets are rising: J&J raised guidance to $101.1B. Tremfya and Icotyde launches are in flight and GSK Specialty Medicines grew +17% CER.',
    why: 'Raised guidance and launch-in-flight signals de-risk multi-year commercialization commitments at J&J and GSK.',
    ifNone: 'J&J and GSK launch budgets get claimed by incumbents while Company stays project-shaped inside their record growth years.',
    next: 'Take a portfolio-level commercialization-capacity proposal to J&J\'s commercial ops teams. Take a Specialty Medicines launch-support offer to GSK this quarter.',
    outcome: 'Company wins multi-year launch-capacity scope at J&J and GSK.',
  },
  'People': {
    what: 'People scores 15/100 — a Low portfolio threat. Talent base is stable with no attrition or succession gaps on the critical accounts.',
    why: 'Low exposure: staffing stability is not currently a driver of portfolio threat.',
    next: 'No action required this cycle; maintain succession readiness and current staffing levels.',
    outcome: 'People risk stays below the threat threshold.',
  },
}
const toSig = (m: CIModule[]) => m.map(x => ({ module: x.module, text: x.signal }))
const radarPopup = (axis: string, v: number): PopupData => {
  const severity = v >= 75 ? 'Critical' : v >= 50 ? 'Elevated' : v >= 25 ? 'Moderate' : 'Low'
  const intel = RADAR_INTEL[axis]
  return {
    what: intel ? intel.what : `${axis}: portfolio threat score ${v}/100 — ${severity}.`,
    signals: toSig(ciFor(null)),
    why: intel ? intel.why : v >= 75 ? 'Critical driver of the HIGH portfolio threat read; it is actively shaping the accounts we must protect.' : v >= 50 ? 'Elevated: active pressure that needs monitoring on the largest accounts.' : v >= 25 ? 'Moderate: watch for movement before it escalates.' : 'Low: minimal current impact on the portfolio.',
    ifNone: intel?.ifNone ?? (v >= 50 ? `${axis} pressure compounds across the largest accounts before the portfolio team reprioritizes.` : undefined),
    next: intel ? intel.next : `Have the portfolio lead reassess ${axis.toLowerCase()} against the two highest-exposure accounts this cycle and pull the matching NBA forward.`,
    outcome: intel ? intel.outcome : `${axis} threat contribution reduced on the accounts driving the portfolio HIGH read.`,
  }
}
const gapOf = (a: Account) => Math.round((a.clientGrowth - a.ourGrowth) * 10) / 10
const GROWTH_GAP_NBA: Record<string, string> = {
  jnj: 'J&J\'s tight 1.6% coupling comes from 80% penetration inside Tremfya, Icotyde and Darzalex launch engines. Replicate this playbook on the lagging accounts before their expansion lands elsewhere. Novartis (7% gap): anchor to bolt-on M&A launch support before the insourcing pilot scales. Sanofi (6% gap): anchor to AI-powered portfolio transformation inside the ExCo reset window. GSK (5% gap): anchor to AI-enabled R&D and Specialty Medicines growth. AZ (4% gap): anchor to the digital-health hub before Evinova locks the mandate.',
  gsk: 'Map GSK\'s fastest-growing Specialty Medicines units (+17% CER) against Company AI/MLR service lines. Take a governed-AI expansion to the CSO office before the budget cycle locks.',
  sanofi: 'Engage Sanofi\'s new ExCo buying committee inside the 90-day vendor-list window. Lead with AI-enabled launch modernization beyond Dupixent to diversify the portfolio.',
  novartis: 'Anchor Company to Novartis bolt-on M&A launch support before the insourcing pilot scales. Convert the +1% cc momentum risk into named commercialization scope on acquired assets.',
  az: 'Engage the AZ digital-health hub sponsor before Evinova\'s Accenture/AWS partnership locks the mandate. Couple Company growth to AZ\'s oncology-led $80B engine through AI-enabled development.',
}
const clientGapPopup = (a: Account): PopupData => {
  const gap = gapOf(a)
  return {
    what: `${a.name}: client YoY +${a.clientGrowth}% vs our +${a.ourGrowth}% — a ${gap}% gap.`,
    signals: [{ module: 'Financials', text: `Client growing +${a.clientGrowth}% vs Company +${a.ourGrowth}% on the account (${gap}% gap).` }, ...toSig(ciFor(a.key).slice(0, 3))],
    why: gap >= 5 ? 'The client is growing faster than our revenue on the account: wallet-share erosion, since their expansion is landing with other partners.' : gap >= 2 ? 'We are roughly keeping pace with client momentum.' : 'Company growth on this account tracks client momentum within ~2% — the tightest coupling in the portfolio.',
    ifNone: gap >= 5 ? `${a.name}'s growth keeps accruing to competitors and the ${gap}% gap widens into a structural wallet-share loss.` : undefined,
    next: GROWTH_GAP_NBA[a.key],
    outcome: gap >= 5 ? `Company growth re-coupled to ${a.name}'s, closing the ${gap}% wallet-share gap.` : undefined,
  }
}
const concentrationPopup = (a: Account, pct: number): PopupData => ({
  what: `${a.name} is ${pct}% of portfolio revenue; AstraZeneca + GSK together are 62%.`,
  signals: [
    { module: 'Financials', text: `${a.name} share ${pct}%; top-two (AZ + GSK) concentration at 62%.` },
    ...toSig(ciFor(a.key).slice(0, 2)),
    { module: 'Sales & Growth', text: 'Portfolio growth increasingly dependent on two accounts — diversification is the hedge.' },
  ],
  why: pct >= 25 ? 'This account carries a disproportionate share of portfolio revenue, so a stumble here hits the whole portfolio.' : 'Portfolio growth is increasingly dependent on the top two accounts, raising concentration risk.',
  ifNone: 'A stumble at AstraZeneca or GSK takes an outsized share of portfolio revenue with it, with no diversified base to absorb it.',
  next: 'Accelerate whitespace conversion in Sanofi, Novartis and J&J to dilute the AZ + GSK concentration before it becomes structural.',
  outcome: 'Portfolio revenue less dependent on the top two accounts.',
})
const battlefieldPopup = (a: Account): PopupData => ({
  what: `${a.name}: ${a.strat} posture — penetration ${a.pen}%, opportunity score ${a.opp_xy}%. Value in play $${a.risk || a.opp}M.`,
  signals: [{ module: 'Sales & Growth', text: `Penetration ${a.pen}%, opportunity ${a.opp_xy}%, $${a.risk || a.opp}M in play under a ${a.strat} strategy.` }, ...toSig(ciFor(a.key).slice(0, 3))],
  why: a.risk > 0 ? `$${a.risk}M of revenue is at risk while opportunity remains ${a.opp_xy}%: protect the base before expanding.` : `${a.name} is a whitespace play with $${a.opp}M in opportunity: timing matters.`,
  ifNone: a.risk > 0 ? `$${a.risk}M erodes while the ${a.opp_xy}% opportunity is left to a competitor at ${a.name}.` : `The $${a.opp}M ${a.name} whitespace is claimed by whoever enters first.`,
  next: a.risk > 0 ? `Have the account team run a base-protection review on the $${a.risk}M exposure at ${a.name}, then sequence expansion on the ${a.strat} opportunity line (${a.opp_xy}%).` : `Drive ${a.name} whitespace conversion through the ${a.strat} entry point with the AE this quarter (${a.opp_xy}% opportunity).`,
  outcome: a.risk > 0 ? `${a.name} base protected and expansion sequenced on the ${a.opp_xy}% opportunity.` : `${a.name} whitespace converted into a named pursuit.`,
})
const heatPopup = (acc: string, dim: string, tone: RAG): PopupData => {
  const a = ACC(acc)
  if (acc === 'gsk' && dim === 'Data & AI') {
    return {
      what: 'GSK is explicitly using AI in drug discovery via a Relation Therapeutics collaboration combining human cellular datasets with AI models for target discovery.',
      signals: toSig(ciFor('gsk')),
      why: 'GSK AI spend is up 42% while our AI-services penetration stays low: a direct whitespace if we move first.',
      ifNone: 'Competitor AI/R&D activity consolidates the Data & AI capability at GSK before Company establishes an R&D executive entry.',
      next: 'Run an executive AI/R&D discovery workshop with GSK R&D leadership anchored on target-discovery use cases and a governed-AI reference.',
      outcome: 'An R&D executive entry established before competitors own the Data & AI mandate.',
    }
  }
  const score = tone === 'red' ? 72 : tone === 'amber' ? 55 : 32
  return {
    what: `${dim} on ${a.name} is rated ${tone.toUpperCase()} — opportunity score ${score}/100.`,
    signals: [{ module: 'Service Line', text: `${dim} rated ${tone.toUpperCase()} at ${a.name} (score ${score}/100).` }, ...toSig(ciFor(acc).slice(0, 3))],
    why: tone === 'red' ? 'Competitive risk: capability ownership may consolidate around competitors if we don\'t engage.' : tone === 'amber' ? 'Early-stage growth: client investment is rising, opening an expansion window.' : 'Strong footprint: low near-term risk.',
    ifNone: tone === 'red' ? `A competitor consolidates ${dim} ownership at ${a.name} before Company engages.` : undefined,
    next: tone === 'red' ? `Have the account team bring a ${dim} capability proof point to ${a.short}'s owners before ownership consolidates around a competitor.` : tone === 'amber' ? `Track ${a.short} ${dim} investment and bring a proof point to the sponsor the moment budget commits — early-stage but rising.` : `Maintain the ${dim} footprint at ${a.short}; no active intervention needed.`,
    outcome: tone === 'red' ? `${dim} defended at ${a.name} before competitor consolidation.` : tone === 'amber' ? `${dim} opportunity readiness maintained at ${a.name}.` : undefined,
  }
}
// Chart dot/row/bubble click → Connected-Intelligence drawer, built from the same
// PopupData the hover uses (connected signals + why + if-none + NBA + outcome).
function chartEv(acc: string | null, title: string, tone: Tone, p: PopupData, extra?: Partial<EvidenceItem>): EvidenceItem {
  const name = acc ? ACC(acc).name : 'Portfolio'
  return ev(acc, title, p.what, tone, {
    connectedModules: p.signals?.map(s => ({ module: s.module, signal: s.text })),
    so_what: p.why, if_no_action: p.ifNone, expected_outcome: p.outcome,
    priority: tone === 'red' ? 'High' : tone === 'amber' ? 'Medium' : 'Low',
    nbas: p.next ? [{ action: p.next, actor: 'Account Executive + relevant service-line lead', target: `${name} decision-makers`, whyNow: p.why, outcome: p.outcome ?? '' }] : undefined,
    ...extra,
  })
}
// KPI popup → Connected-Intelligence drawer evidence. Whole-card and per-signal.
function kpiCardEv(label: string, p: PopupData): EvidenceItem {
  return {
    id: `kpi:${label}`, kind: 'signal', accountId: null, accountName: 'Portfolio', accentColor: CHEX.amber,
    title: label, categoryLabel: 'Executive Signal', priority: 'High', confidence: 'Medium',
    what_happened: p.what,
    connectedModules: p.signals?.map(s => ({ module: s.module, signal: s.text })),
    why_it_matters: p.why, if_no_action: p.ifNone,
    nbas: p.nbas?.length ? p.nbas : undefined,
    next_best_action: p.nbas?.length ? undefined : p.next, expected_outcome: p.outcome,
    sources: [], dateISO: null,
  }
}
function kpiSignalEv(label: string, p: PopupData, i: number): EvidenceItem {
  const s = p.signals![i]
  return {
    id: `kpi:${label}:${i}`, kind: 'signal', accountId: null, accountName: 'Portfolio', accentColor: CHEX.amber,
    title: `${label} — ${s.module}`, categoryLabel: s.module, priority: 'High', confidence: 'Medium',
    what_happened: s.text,
    connectedModules: p.signals?.map(x => ({ module: x.module, signal: x.text })),
    why_it_matters: p.why, if_no_action: p.ifNone,
    nbas: p.nbas?.length ? p.nbas : undefined,
    next_best_action: p.nbas?.length ? undefined : p.next, expected_outcome: p.outcome,
    sources: [], dateISO: null,
  }
}
function Kpi({ num, icon: Icon, label, desc, delta, insight, meter = 50, popup, open, onViewDetail }: { tone: Tone; num: string; icon: LucideIcon; label: string; desc?: string; delta?: string; insight?: string; meter?: number; popup: PopupData; open: (eyebrow: string, title: string, items: EvidenceItem[]) => void; onViewDetail: () => void }) {
  const onCardClick = () => open('Portfolio', label, [kpiCardEv(label, popup)])
  const onSignalClick = (i: number) => open('Portfolio', `${label} — ${popup.signals![i].module}`, [kpiSignalEv(label, popup, i)])
  return (
    // Whole card clickable → opens the Connected-Intelligence drawer. Each sub-card
    // clickable → opens that connected signal. Gold neon glow on hover (kpi-glow).
    <Card
      onClick={onCardClick}
      className="home-panel home-kpi-card kpi-glow"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 148,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        background: 'linear-gradient(150deg,#1B365D,#223f6e)',
        borderColor: 'rgba(212,175,55,0.38)',
        boxShadow: '0 14px 34px rgba(13,26,46,0.18)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'linear-gradient(135deg, rgba(212,175,55,0.45) 0 1px, transparent 1px 18px)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, minHeight: 58 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} color="#D4AF37" strokeWidth={2.2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 26, lineHeight: 1, fontWeight: 850, color: '#fff', letterSpacing: 0 }}>{num}</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.82)', marginTop: 8, textTransform: 'uppercase', overflowWrap: 'anywhere' }}>{label}</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'relative', marginTop: 15 }}>
        <div>
          {desc && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.84)', fontWeight: 600, lineHeight: 1.35 }}>{desc}</div>}
          {delta && <div style={{ fontSize: 11.5, color: '#D4AF37', marginTop: 5, fontWeight: 750 }}>{delta}</div>}
        </div>
      </div>

      {/* Sub-cards: the connected signals across modules that justify the number.
          Each is independently clickable → opens that signal's drawer. */}
      {popup.signals && popup.signals.length > 0 && (
        <div style={{ position: 'relative', marginTop: 14 }}>
          <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.85)', marginBottom: 8 }}>
            What justifies this · {popup.signals.length} connected signals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }} className="home-kpi-subgrid">
            {popup.signals.map((s, i) => (
              <button key={i} type="button"
                onClick={e => { e.stopPropagation(); onSignalClick(i) }}
                className="kpi-glow"
                style={{ textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 9, padding: '9px 11px', minHeight: 92, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: 4 }}>{s.module}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', lineHeight: 1.45 }}>{s.text}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, paddingTop: 14 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 5, overflow: 'hidden', background: 'rgba(255,255,255,0.16)' }}>
          <div style={{ width: `${meter}%`, height: '100%', borderRadius: 5, background: '#D4AF37' }} />
        </div>
        {insight && <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.68)', fontWeight: 750, whiteSpace: 'nowrap' }}>{insight}</span>}
      </div>

      {/* View detail — scrolls to the matching detail section below. Own click
          (stops card-drawer). Pinned so all four cards align. */}
      <div style={{ position: 'relative', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" onClick={e => { e.stopPropagation(); onViewDetail() }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11.5, fontWeight: 800, color: '#D4AF37', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          View detail <ArrowRight size={13} />
        </button>
      </div>
    </Card>
  )
}
function Gauge({ onClick }: { onClick: () => void }) {
  const { hover, enter, leave, move, pos } = useCardPopup()
  const popup: PopupData = {
    what: `Portfolio threat is rated HIGH at ${TOTALS.portfolioThreat}/100 — driven by competition (88), AI disruption (82) and client insourcing (78).`,
    why: 'The portfolio\'s biggest accounts are being contested on three fronts at once: competitors moving first on AI, and clients automating or insourcing our traditional service mix.',
    next: 'Open the Threat Radar to see which account drives each threat, then target the two largest exposures (GSK, AZ) first.',
  }
  return (
    <div style={{ position: 'relative' }}>
      <Card onClick={onClick} className="home-panel" style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#1B365D,#223f6e)', borderColor: 'rgba(212,175,55,0.38)', boxShadow: '0 14px 34px rgba(13,26,46,0.18)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'linear-gradient(135deg, rgba(212,175,55,0.45) 0 1px, transparent 1px 18px)' }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.82)', fontWeight: 800, textTransform: 'uppercase' }}>Threat Level</div>
            <div onMouseEnter={enter} onMouseLeave={leave} onMouseMove={move}
              style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, margin: '8px 0 2px', padding: '2px 7px', marginLeft: -7, borderRadius: 8, cursor: 'pointer', background: hover ? 'rgba(255,255,255,0.12)': 'transparent', transition: 'background 160ms ease' }}>
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 850, textDecoration: hover ? 'underline dotted rgba(212,175,55,0.9) 1.5px': 'none', textUnderlineOffset: 4 }}>HIGH</span><span style={{ color: 'rgba(255,255,255,0.68)', fontSize: 12.5 }}>{TOTALS.portfolioThreat}/100</span>
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.4)' }}>
            <AlertTriangle size={19} color="#D4AF37" />
          </div>
        </div>
        <div style={{ position: 'relative', margin: '14px 0 8px' }}>
          <div style={{ height: 9, borderRadius: 6, background: 'rgba(255,255,255,0.16)', position: 'relative', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
            <div style={{ width: `${TOTALS.portfolioThreat}%`, height: '100%', borderRadius: 6, background: '#D4AF37' }} />
            <div style={{ position: 'absolute', top: -5, left: `${TOTALS.portfolioThreat}%`, width: 4, height: 20, background: '#fff', borderRadius: 2, boxShadow: '0 0 0 3px rgba(27,54,93,0.45)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.68)', marginTop: 6, textTransform: 'uppercase', fontWeight: 700 }}><span>Low</span><span>Moderate</span><span>High</span></div>
      </Card>
      <AnimatePresence>
        {hover && <SignalPopover key="gauge-pop" label="Threat Level" icon={<AlertTriangle size={15} color="var(--navy)" />} what={popup.what} why={popup.why} next={popup.next} x={pos.x} y={pos.y} onMouseEnter={enter} onMouseLeave={leave} />}
      </AnimatePresence>
    </div>
  )
}

/* ================= CHARTS / MINIS ================= */
function Radar({ onDot }: { onDot: (axis: string, v: number, tone: Tone) => void }) {
  const n = RADAR.length, R = 74, cx = 110, cy = 96
  const sev = (v: number) => v >= 75 ? '#12294a': v >= 50 ? '#3a5a8c': v >= 25 ? '#b89428': '#D4AF37'
  const toneOf = (v: number): Tone => v >= 75 ? 'red' : v >= 50 ? 'amber' : 'green'
  const pt = (i: number, r: number) => { const a = (Math.PI * 2 * i / n) - Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] }
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="230" height="205" viewBox="0 0 220 200">
        {[0.25, 0.5, 0.75, 1].map((f, k) => <polygon key={k} points={RADAR.map((_, i) => pt(i, R * f).join(',')).join(' ')} fill="none" stroke="rgba(27,54,93,0.1)" />)}
        {RADAR.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(27,54,93,0.12)" /> })}
        <polygon points={RADAR.map((d, i) => pt(i, R * d.v / 100).join(',')).join(' ')} fill="rgba(27,54,93,0.14)" stroke="#1B365D" strokeWidth={2} />
        {RADAR.map((d, i) => { const [x, y] = pt(i, R * d.v / 100); return (
          <SvgDotTip key={i} label={d.axis} icon={<AlertTriangle size={15} color="var(--navy)" />} popup={radarPopup(d.axis, d.v)}>
            <circle cx={x} cy={y} r={14} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onDot(d.axis, d.v, toneOf(d.v))} />
            <circle className="dot-clickable-svg" cx={x} cy={y} r={4.5} fill={sev(d.v)} style={{ pointerEvents: 'none' }} />
          </SvgDotTip>
        )})}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1B365D" letterSpacing={1}>Company</text>
        {RADAR.map((d, i) => { const [x, y] = pt(i, R + 16); return <text key={i} x={x} y={y} textAnchor="middle" fontSize={8.5} fill="var(--text-3)">{d.axis}</text> })}
      </svg>
    </div>
  )
}
function ClientVsOur({ onDot }: { onDot: (a: Account) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      <div style={{ position: 'relative', width: '100%', height: 210 }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
        <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Us ↑</span>
        <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Client growth →</span>
        {ACCOUNTS.map(a => { const gap = gapOf(a); return (
          <DotTip key={a.key} label={`${a.name}: growth gap`} icon={gap >= 5 ? <TrendingDown size={15} color="var(--navy)" /> : <TrendingUp size={15} color="var(--navy)" />} popup={clientGapPopup(a)}>
            <div onClick={() => onDot(a)} title={`${a.name}: client +${a.clientGrowth}% / us +${a.ourGrowth}%`} style={{ position: 'absolute', left: `${Math.min(a.clientGrowth * 9, 92)}%`, top: `${100 - Math.min(a.ourGrowth * 14, 92)}%`, transform: 'translate(-50%,-50%)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span className="dot-clickable" style={{ width: 15, height: 15, borderRadius: '50%', background: CVAR[gap >= 5 ? 'red': gap >= 2 ? 'amber': 'green'] }} />
              <span style={{ fontSize: 9.5, color: 'var(--text-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.short}</span>
            </div>
          </DotTip>)})}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: 'var(--text-3)', marginTop: 8, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: CVAR.red }} />Wallet loss risk</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: CVAR.green }} />Outperforming</span>
      </div>
    </div>
  )
}
function Concentration({ onRow }: { onRow: (a: Account) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      {CONCENTRATION.map(c => { const a = ACC(c.acc); const tone: Tone = c.pct >= 25 ? 'red': c.pct >= 15 ? 'amber': 'green'; return (
        <div key={c.acc} className="home-glow" onClick={() => onRow(a)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
          <span style={{ width: 74, fontSize: 12, color: 'var(--text-2)' }}>{a.short}</span>
          <div style={{ flex: 1, height: 10, borderRadius: 5, background: 'var(--navy-faint)', overflow: 'hidden' }}><div style={{ width: `${c.pct * 2.5}%`, height: '100%', background: CVAR[tone], borderRadius: 5 }} /></div>
          <span style={{ width: 38, textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{c.pct}%</span>
        </div>)})}
      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 8 }}>62% concentrated in AstraZeneca + GSK.</div>
    </div>
  )
}
function Battlefield({ onBubble }: { onBubble: (a: Account) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      <div style={{ position: 'relative', width: '100%', height: 210 }}>
        <span style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Expand</span>
        <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Watch</span>
        <span style={{ position: 'absolute', left: 0, top: '50%', fontSize: 9, color: 'var(--text-3)' }}>Low pen.</span>
        <span style={{ position: 'absolute', right: 0, top: '50%', fontSize: 9, color: 'var(--text-3)' }}>High pen.</span>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
        {ACCOUNTS.map(a => { const size = 30 + a.risk * 5 + a.opp * 5; return (
          <DotTip key={a.key} label={a.name} icon={<Compass size={15} color="var(--navy)" />} popup={battlefieldPopup(a)}>
            <div onClick={() => onBubble(a)} title={a.name} className="dot-clickable" style={{ position: 'absolute', left: `${a.pen}%`, top: `${100 - a.opp_xy}%`, width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: '#fff', background: CVAR[a.color], opacity: 0.9, transform: 'translate(-50%,-50%)', cursor: 'pointer' }}>{a.short.slice(0, 3)}</div>
          </DotTip>)})}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10.5, color: 'var(--text-3)', flexWrap: 'wrap' }}>{([['Attack', 'red'], ['Expand', 'green'], ['Protect', 'amber'], ['Watch', 'blue']] as [string, Tone][]).map(([l, c]) => <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: CVAR[c] }} />{l}</span>)}</div>
    </div>
  )
}
function Heatmap({ onCell }: { onCell: (acc: string, dim: string, tone: RAG) => void }) {
  return (
    <div style={{ overflowX: 'auto' }} onClick={e => e.stopPropagation()}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr><th style={thL}>Acct</th>{HEATCOLS.map(c => <th key={c} style={{ ...thC, fontSize: 8.5 }}>{c.split(' ')[0]}</th>)}</tr></thead>
        <tbody>{ACCOUNTS.map(a => (<tr key={a.key}><td style={{ padding: '6px', color: 'var(--text-2)' }}>{a.short}</td>{HEATCOLS.map(c => { const t = HEATDATA[a.key][c]; return <td key={c} style={{ textAlign: 'center', padding: '6px' }}><DotTip label={`${c} · ${a.name}`} icon={<Target size={15} color="var(--navy)" />} popup={heatPopup(a.key, c, t)}><span onClick={() => onCell(a.key, c, t)} title={`${a.name} · ${c}`} className="dot-clickable" style={{ width: 13, height: 13, borderRadius: '50%', display: 'inline-block', background: CVAR[t], cursor: 'pointer' }} /></DotTip></td> })}</tr>))}</tbody>
      </table>
    </div>
  )
}
function Spark({ vals, color, w = 90, h = 26 }: { vals: number[]; color: string; w?: number; h?: number }) {
  const max = Math.max(...vals), min = Math.min(...vals)
  const pts = vals.map((v, i) => `${i / (vals.length - 1) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(' ')
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} /></svg>
}
function Early({ onRow }: { onRow: (a: Account) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      {[...ACCOUNTS].sort((a, b) => b.score - a.score).map((a, i) => (
        <div key={a.key} className="home-glow" onClick={() => onRow(a)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 6px', cursor: 'pointer', borderTop: i === 0 ? 'none': '1px solid var(--border)' }}>
          <span style={{ width: 70, fontSize: 12, color: 'var(--text-1)' }}>{a.short}</span>
          <span style={{ width: 48, fontSize: 12, color: 'var(--text-3)' }}>{a.score}/100</span>
          <div style={{ flex: 1 }}><Spark vals={a.trend} color={CVAR[a.color]} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, color: CVAR[a.color], width: 62, textAlign: 'right' }}>{a.status}</span>
        </div>))}
    </div>
  )
}
function Chain({ chain, onClick }: { chain: ChainDef; onClick: () => void }) {
  const end = chain.nodes[chain.nodes.length - 1].c
  return (
    <div className="home-glow" onClick={onClick} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', width: '100%', border: '1px solid var(--border)', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: CVAR[end] }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{ACC(chain.acc).name}</span>
        <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>· {chain.confidence}% confidence</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 2 }}>
        {chain.nodes.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {i > 0 && <span style={{ color: 'var(--text-3)', fontSize: 13 }}>→</span>}
            <span style={{ background: 'var(--bg-raised)', border: `1px solid ${CVAR[c.c]}55`, borderRadius: 9, padding: '8px 10px', textAlign: 'center', fontSize: 10.5, minWidth: 92, color: 'var(--text-2)' }}>{c.t}{c.v && <div style={{ fontSize: 13, fontWeight: 800, marginTop: 3, color: CVAR[c.c] }}>{c.v}</div>}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const url = avatarUrl(name)
  return (
    <span style={{ width: size, height: size, borderRadius: 10, flexShrink: 0, overflow: 'hidden', background: '#1B365D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.32, border: '1.5px solid var(--gold-light)' }}>
      {url
        ? <img src={url} alt={name} width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
       : initialsOf(name)}
    </span>
  )
}
function ExecMini({ onCard }: { onCard: (e: Exec) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} onClick={e => e.stopPropagation()}>
      {EXEC_MOVES.slice(0, 3).map(e => (
        <div key={e.name} className="home-glow" onClick={() => onCard(e)} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '9px 9px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
          <Avatar name={e.name} size={40} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>{e.name}</span>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: CVAR[e.signal], flexShrink: 0 }} />
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{e.title} · {ACC(e.acc).short}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.45, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.focus}</div>
          </div>
        </div>))}
    </div>
  )
}
function PipelineMini({ onRow }: { onRow: (p: typeof PIPELINE[number]) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      {PIPELINE.map(p => { const tone: Tone = p.pct >= 85 ? 'green': p.pct >= 65 ? 'amber': 'red'; return (
        <div key={p.q} className="home-glow" onClick={() => onRow(p)} style={{ marginBottom: 4, padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{p.q}</span><span style={{ color: CVAR[tone], fontWeight: 700 }}>{p.pct}% of target</span></div>
          <div style={{ height: 12, borderRadius: 6, background: 'var(--navy-faint)', overflow: 'hidden' }}><div style={{ width: `${p.pct}%`, height: '100%', background: CVAR[tone], borderRadius: 6 }} /></div>
        </div>)})}
      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>Q3 covered; Q4/Q1 coverage insufficient.</div>
    </div>
  )
}
function BigBetsMini({ onRow }: { onRow: (b: typeof BIG_BETS[number]) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      {BIG_BETS.map(b => { const tone: Tone = b.progress < 20 ? 'red': b.progress < 60 ? 'amber': 'green'; return (
        <div key={b.title} className="home-glow" onClick={() => onRow(b)} style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{b.title}</span><span style={{ color: 'var(--text-3)' }}>{b.progress}%</span></div>
          <div style={{ height: 6, borderRadius: 4, background: 'var(--navy-faint)', overflow: 'hidden' }}><div style={{ width: `${b.progress}%`, height: '100%', background: CVAR[tone] }} /></div>
        </div>)})}
    </div>
  )
}
function WhitespaceMini({ onRow }: { onRow: (w: typeof WHITESPACE[number]) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      {WHITESPACE.map(w => (
        <div key={w.rank} className="home-glow" onClick={() => onRow(w)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#1B365D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{w.rank}</span>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>{ACC(w.acc).short}: {w.title}</div><div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{w.conf} confidence</div></div>
          <ArrowUpRight size={14} color="var(--emerald)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>))}
    </div>
  )
}
function NbaList({ items, onRow }: { items: Nba[]; onRow: (n: Nba) => void }) {
  return (
    <div onClick={e => e.stopPropagation()}>
      {items.map((n, i) => { const Icon = n.icon; return (
        <div key={n.title} className="home-glow" onClick={() => onRow(n)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 8px', borderTop: i === 0 ? 'none': '1px solid var(--border)', cursor: 'pointer' }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, padding: '3px 7px', borderRadius: 5, background: CBG[n.color], color: CVAR[n.color], flexShrink: 0 }}>{n.prio}</span>
          <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: CBG[n.color] }}><Icon size={15} color={CVAR[n.color]} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{n.title}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{n.why}</div></div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', width: 96, flexShrink: 0 }} className="nba-hide">{n.impact}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', width: 90, flexShrink: 0 }} className="nba-hide">{n.owner}</div>
          <span style={{ fontSize: 11.5, fontWeight: 700, padding: '6px 12px', borderRadius: 7, border: `1px solid ${CVAR[n.color]}44`, color: CVAR[n.color], display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>Act <ArrowRight size={12} /></span>
        </div>)})}
    </div>
  )
}

/* ================= DETAIL SHELL & BITS ================= */
function Detail({ id, idx, title, sub, children }: { id: string; idx: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 'calc(var(--topbar-h) + 16px)' }}>
      <Card style={{ borderRadius: 'var(--radius-lg)', padding: '26px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}><span style={{ color: 'var(--gold-muted)', fontSize: 12, fontWeight: 700 }}>{idx}</span><h2 style={{ fontSize: 19, margin: 0, fontWeight: 700, color: 'var(--text-1)' }}>{title}</h2></div>
        <div style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 20 }}>{sub}</div>
        {children}
      </Card>
    </section>
  )
}
function AccCard({ name, pill, tone, children, onClick }: { name: string; pill: string; tone: Tone; children?: React.ReactNode; onClick?: () => void }) {
  return (
    <div className={`card${onClick ? ' home-panel': ''}`} onClick={onClick} style={{ background: 'var(--bg-raised)', padding: '16px 18px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}><span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{name}</span><span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6, background: CBG[tone], color: CVAR[tone], whiteSpace: 'nowrap' }}>{pill}</span></div>
      {children}
    </div>
  )
}
function MLine({ k, v, vColor }: { k: string; v: string; vColor?: string }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5, color: 'var(--text-3)', padding: '4px 0' }}><span>{k}</span><b style={{ color: vColor ?? 'var(--text-1)' }}>{v}</b></div>
}
function ChangeCard({ c, onClick }: { c: Change; onClick: () => void }) {
  const tone: Tone = c.tag === 'critical' ? 'red': 'green'
  return (
    <div className="home-glow" onClick={onClick} style={{ padding: '12px 12px', marginBottom: 9, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 5, background: CBG[tone], color: CVAR[tone] }}>{c.impact.toUpperCase()}</span>
        <span style={{ fontSize: 10.5, color: 'var(--text-3)', flex: 1 }}>{c.cat} · {c.time}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: CVAR[tone] }}>{c.val}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, margin: '8px 0 4px', lineHeight: 1.4, color: 'var(--text-1)' }}>{c.title}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{c.body}</div>
    </div>
  )
}
