// ─── Sales & Growth module — assembled data index ─────────────────────────────
// Aggregates the five per-account data files into the export surface the Growth
// and Account pages consume. Seller = Company throughout. Prepared July 2026.

import { LIST_astrazeneca, INFO_astrazeneca, PLAN_astrazeneca, EXECS_astrazeneca, ORG_astrazeneca, NEWS_astrazeneca, Company_astrazeneca } from './growth/astrazeneca'
import { LIST_gsk, INFO_gsk, PLAN_gsk, EXECS_gsk, ORG_gsk, NEWS_gsk, Company_gsk } from './growth/gsk'
import { LIST_jnj, INFO_jnj, PLAN_jnj, EXECS_jnj, ORG_jnj, NEWS_jnj, Company_jnj } from './growth/jnj'
import { LIST_novartis, INFO_novartis, PLAN_novartis, EXECS_novartis, ORG_novartis, NEWS_novartis, Company_novartis } from './growth/novartis'
import { LIST_sanofi, INFO_sanofi, PLAN_sanofi, EXECS_sanofi, ORG_sanofi, NEWS_sanofi, Company_sanofi } from './growth/sanofi'
import { HUMANTIC_NEWS, type HumanticSignal } from './humanticSignals'

// Humantic signals → news-item shape (structured tail folded into the body so it
// surfaces in the news modal). Prepended to the matching account's external news.
function humanticToNews(s: HumanticSignal) {
  return {
    id: s.id, title: s.title, date: s.date, featured: s.featured,
    body: `${s.body}  ·  Suggested action: ${s.suggestedAction}  ·  Sources: ${s.sources.join('; ')}`,
    score: s.score, suggestedAction: s.suggestedAction, sources: s.sources,
  }
}
const HUMANTIC_BY_ACCOUNT: Record<string, any[]> = Object.fromEntries(
  Object.entries(HUMANTIC_NEWS).map(([id, list]) => [id, list.map(humanticToNews)])
)

// ─── MODULES (landing tiles) ──────────────────────────────────────────────────
export const MODULES = [
  { id: 'sales',    title: 'Sales & Growth Intelligence', desc: 'Monitor revenue streams, pipeline health, and high-value growth opportunities across global markets.',            icon: 'TrendingUp',   status: 'active' as const, path: '/executive-summary' },
  { id: 'mktg',     title: 'Marketing & Service Line',    desc: 'Deep analytics into service line penetration and efficacy of integrated marketing campaigns on brand positioning.', icon: 'BarChart3',    status: 'soon' as const },
  { id: 'delivery', title: 'Delivery Health',             desc: 'Real-time oversight of project execution, SLA compliance, and operational excellence across the organization.',    icon: 'CheckCircle2', status: 'soon' as const },
  { id: 'talent',   title: 'Talent Internal Health',      desc: 'Insights into organizational culture, retention patterns, and internal skill mapping for strategic planning.',     icon: 'Users',        status: 'soon' as const },
  { id: 'compete',  title: 'Competition Module',          desc: 'Strategic tracking of competitor movement, market share shifts, and disruptive industry trends.',                  icon: 'Target',       status: 'soon' as const },
  { id: 'rfp',      title: 'RFI / RFP Intelligence',      desc: 'Centralized hub for proposal tracking, bid win-loss analysis, and response lifecycle optimization.',              icon: 'FileText',     status: 'soon' as const },
]

// ─── INTERNAL NEWS (Company) ─────────────────────────────────────────────────
// All news current as of June 2026.
export const NEWS_INTERNAL = [
  { id: 'ni1', title: 'Company Named Leader Again in Everest Group Life Sciences Operations PEAK Matrix® 2026', date: 'May 2026', featured: true,
    body: "Company retained its Leader position in the Everest Group Life Sciences Regulatory and Medical Affairs Operations PEAK Matrix® Assessment 2026 — its third consecutive year at the top of the matrix. Everest Group analysts cited Company's expanded global affiliate network (now 850+ in-country experts across 120+ countries), the maturity of the AI-first Company Fusion platform, and proven multi-agency eCTD v4.0 delivery. Company now supports 1,600+ customers worldwide with 2,500+ regulatory and commercialization experts. The recognition reinforces Company as the partner of choice for regulated life sciences companies pursuing AI-driven regulatory and commercial operations at scale." },
  { id: 'ni2', title: 'Company Fusion 2.0 Released — GenAI Dossier Authoring and Multi-LLM Orchestration Go GA', date: 'Apr 2026',
    body: "Company announced general availability of Company Fusion 2.0, adding a production-grade GenAI dossier authoring module targeting 50%+ compilation-time reduction, multi-LLM orchestration with domain-specific GxP guardrails, and native eCTD v4.0 publishing through SUBMIT PRO. Built on 15+ years of regulatory and commercialization delivery data, Company Fusion 2.0 is ISO 27001/27701 certified with full audit trails and human-in-the-loop validation by design. The release directly answers the industry shift toward auditable, enterprise-scale regulatory AI that regulated knowledge-work demands." },
  { id: 'ni3', title: 'Company Expands Japan Operations Ahead of PMDA eCTD v4.0 Mandate', date: 'Mar 2026',
    body: "With PMDA Japan the first agency globally to mandate eCTD v4.0 (effective 2026), Company expanded its Tokyo regulatory operations centre and is now supporting multiple sponsors through their first v4.0 submissions. The expansion strengthens Company's position for Japan-headquartered clients executing simultaneous US/EU/Japan filings, and complements the December 2025 start of EMA optional v4.0 acceptance ahead of the planned 2027 EU mandate." },
  { id: 'ni4', title: 'Company Launches Company Intelligence Real-Time Regulatory Monitoring — 95,000+ Regulations, 200+ Markets', date: 'Feb 2026',
    body: "Company scaled Company Intelligence, its regulatory intelligence SaaS, to track 95,000+ regulations across 200+ markets with BOT-driven real-time monitoring, Company KnowledgeGraphs for cross-country comparison, and an AI chatbot in 60+ languages. Positioned as an auditable, cost-efficient substitute for in-house monitoring headcount, the platform is being adopted by sponsors under cost-reduction mandates who need always-on compliance coverage without expanding FTEs." },
  { id: 'ni5', title: 'Company Featured in CIO Bulletin — 2026 Strategic Growth and Global Footprint', date: 'Jan 2026',
    body: "Company was featured in CIO Bulletin as one of the most strategically significant life-sciences commercialization and regulatory technology companies of 2026, highlighting expansion across 20+ global locations and a deepening footprint in the US, EU, Japan, India, Brazil, and Southeast Asia. The feature called out Company Fusion as a key differentiator in an increasingly competitive landscape and noted Company's single-partner accountability model across regulatory affairs, pharmacovigilance, medical writing, submissions, and omnichannel commercial operations." },
  { id: 'ni6', title: 'Company Wins Multi-Service Mandate with Global Top-20 Pharma', date: 'Jan 2026',
    body: "Company was awarded a multi-year, multi-service mandate with a global top-20 pharmaceutical company spanning Core Services (Regulatory Operations, eCTD publishing, LABEL 360), Growth Services (pharmacovigilance and MLR), and Technology (Company Intelligence + VIA). The win validates Company's Full-Service 'Land–Expand–Transform' model as large pharma consolidate fragmented vendor rosters toward single strategic partners with end-to-end capability — exactly the vendor-rationalisation pressure shaping restructuring programmes across the industry." },
]

// ─── PIPELINE DATA (module-level, illustrative) ───────────────────────────────
export const PIPELINE_QUARTERLY = [
  { quarter: 'Q4-2025', value: 427 },
  { quarter: 'Q1-2026', value: 247 },
  { quarter: 'Q2-2026', value: 338 },
  { quarter: 'Q3-2026', value: 125 },
]
export const PIPELINE_NET_RENEWALS = [
  { quarter: 'Q4-2025', netNew: 242, renewals: 185 },
  { quarter: 'Q1-2026', netNew: 213, renewals: 34 },
  { quarter: 'Q2-2026', netNew: 291, renewals: 47 },
  { quarter: 'Q3-2026', netNew: 60,  renewals: 65 },
]
export const BU_DATA = [
  { bu: 'Clinical',    netNew: 17, renewals: 0  },
  { bu: 'Consulting',  netNew: 17, renewals: 0  },
  { bu: 'Commercial',  netNew: 25, renewals: 26 },
  { bu: 'DeviceTech',  netNew: 0,  renewals: 0  },
  { bu: 'ECS',         netNew: 37, renewals: 2  },
  { bu: 'EMS',         netNew: 40, renewals: 41 },
  { bu: 'Multi BU',    netNew: 0,  renewals: 0  },
  { bu: 'Omnichannel', netNew: 0,  renewals: 0  },
  { bu: 'Technology',  netNew: 0,  renewals: 0  },
]
export const MARQUEE_DEALS = [
  { id: 'd1', title: 'Novo US — AEM Cloud Migration — Digital Content', company: 'Novo Nordisk Inc.', tags: ['Tech Consulting', 'ECS', 'Commercial'], badges: [{ label: 'Million Dollar Club', color: 'green' }, { label: 'Large deal', color: 'amber' }], stage: 'Offer', forecast: 'Lost/No-go/Omitted', closeDate: 'Feb 2026', acv: '$0', tcv: '$3.0M', selected: '$3.0M' },
  { id: 'd2', title: 'Novartis INTL — Content Production (RFP)', company: 'Novartis Pharmaceuticals', tags: ['Campaign & Media Ops', 'Commercial', 'Pharma'], badges: [{ label: 'Large deal', color: 'amber' }], stage: 'Offer', forecast: 'Pipeline - Qualifying 10-25%', closeDate: 'Sept 2026', acv: '$0', tcv: '$6.0M', selected: '$6.0M' },
  { id: 'd3', title: 'Novartis US — End to End Video Production (RFP)', company: 'Novartis Pharmaceuticals', tags: ['Campaign & Media Ops', 'Commercial'], badges: [{ label: 'Large deal', color: 'amber' }], stage: 'Qualification', forecast: 'Prospect 10%', closeDate: 'Oct 2026', acv: '$0', tcv: '$1.0M', selected: '$1.0M' },
  { id: 'd4', title: 'AstraZeneca — China NMPA Variation Management (RFI)', company: 'AstraZeneca plc', tags: ['ECS', 'Regulatory'], badges: [{ label: 'Large deal', color: 'amber' }], stage: 'Offer', forecast: 'Pipeline - Qualifying 10-25%', closeDate: 'Dec 2026', acv: '$0', tcv: '$2.0M', selected: '$2.0M' },
]

// ─── INSIGHT CARDS (Executive Summary) ────────────────────────────────────────
export const INSIGHT_CARDS = [
  { id: 'market-signals',     tag: 'MARKET SIGNALS',      icon: 'TrendingUp',  highlighted: false, preview: 'Industry leaders are converging on compressing regulated knowledge-work cycle times via governed, scalable AI-driven automation—safeguarding launch-readiness and margins under intensifying pricing, portfolio, and supply-chain pressures.', readTime: '5 MIN READ', path: '/executive-summary/article/market-signals' },
  { id: 'emerging-priorities', tag: 'EMERGING PRIORITIES', icon: 'AlertCircle', highlighted: true,  preview: 'Leading pharmaceutical companies are converging on enterprise-wide execution acceleration through governed AI-enabled automation—prioritizing compressed cycle times in regulatory submissions, compliant content supply chains, and omnichannel commercial operations.', readTime: '5 MIN READ', path: '/executive-summary/article/emerging-priorities' },
  { id: 'executive-capital',  tag: 'EXECUTIVE CAPITAL',   icon: 'Users',       highlighted: false, preview: 'A pronounced shift toward consolidating executive authority around governance-grade AI and digital transformation mandates, with boards and C-suite leaders intensifying oversight on cycle-time compression.', readTime: '5 MIN READ', path: '/executive-summary/article/executive-capital' },
]

// ─── BROWSE-BY OPTIONS (Account Planning) ─────────────────────────────────────
export const BROWSE_BY_OPTIONS = ['Executive Briefing', 'Account Context', 'Account Review Recap', 'Business Health', 'Account Priority', 'Our Big Bets', 'Power Centres Responsible', 'Delivery Health Update', 'Competition Update', 'Immediate Next Steps', 'Inferences']

// ─── ACCOUNTS LIST ────────────────────────────────────────────────────────────
export const ACCOUNTS_LIST = [
  LIST_astrazeneca,
  LIST_gsk,
  LIST_jnj,
  LIST_novartis,
  LIST_sanofi,
]

// ─── ACCOUNT INFO / PLAN / Company (keyed by account id) ────────────────────────
export const ACCOUNT_INFO: Record<string, any> = {
  astrazeneca: INFO_astrazeneca,
  gsk: INFO_gsk,
  jnj: INFO_jnj,
  novartis: INFO_novartis,
  sanofi: INFO_sanofi,
}

export const ACCOUNT_PLAN: Record<string, any> = {
  astrazeneca: PLAN_astrazeneca,
  gsk: PLAN_gsk,
  jnj: PLAN_jnj,
  novartis: PLAN_novartis,
  sanofi: PLAN_sanofi,
}

export const Company_PROFILE: Record<string, { companyProfile: any[]; keySignals: any[]; salesIntelligence: any[] }> = {
  astrazeneca: Company_astrazeneca,
  gsk: Company_gsk,
  jnj: Company_jnj,
  novartis: Company_novartis,
  sanofi: Company_sanofi,
}

// ─── EXECUTIVES ───────────────────────────────────────────────────────────────
export const ALL_EXECS: any[] = [
  ...EXECS_astrazeneca,
  ...EXECS_gsk,
  ...EXECS_jnj,
  ...EXECS_novartis,
  ...EXECS_sanofi,
]

// ─── ORG CHARTS (keyed by account id) ─────────────────────────────────────────
export const ORG_BY_ACCOUNT: Record<string, any[]> = {
  astrazeneca: ORG_astrazeneca,
  gsk: ORG_gsk,
  jnj: ORG_jnj,
  novartis: ORG_novartis,
  sanofi: ORG_sanofi,
}

// ─── EXTERNAL NEWS (keyed by account id + flattened) ──────────────────────────
// Humantic signals (where present for an account) are prepended as the freshest,
// highest-priority items.
export const NEWS_EXTERNAL_BY_ACCOUNT: Record<string, any[]> = {
  astrazeneca: [...(HUMANTIC_BY_ACCOUNT.astrazeneca || []), ...NEWS_astrazeneca],
  gsk: [...(HUMANTIC_BY_ACCOUNT.gsk || []), ...NEWS_gsk],
  jnj: [...(HUMANTIC_BY_ACCOUNT.jnj || []), ...NEWS_jnj],
  novartis: [...(HUMANTIC_BY_ACCOUNT.novartis || []), ...NEWS_novartis],
  sanofi: [...(HUMANTIC_BY_ACCOUNT.sanofi || []), ...NEWS_sanofi],
}

export const NEWS_EXTERNAL_ALL: any[] = [
  ...NEWS_EXTERNAL_BY_ACCOUNT.astrazeneca,
  ...NEWS_EXTERNAL_BY_ACCOUNT.gsk,
  ...NEWS_EXTERNAL_BY_ACCOUNT.jnj,
  ...NEWS_EXTERNAL_BY_ACCOUNT.novartis,
  ...NEWS_EXTERNAL_BY_ACCOUNT.sanofi,
]
