// ─── MARKETING & SERVICE LINE SEED ────────────────────────────────────────────
// Generated fresh per master §11 (no seed docx supplied). Intelligence cards across
// the 6 service lines & ~18 competitors; a Whitespace/Popular/Oversaturated topics
// grid; account metrics + executives for the 5 core accounts; next-best-actions.

import type { ServiceLineId } from './shared'

export interface IntelligenceCard {
  id: string
  competitor: string
  service_line: ServiceLineId
  tags: string[]
  headline: string
  summary: string
  what_this_means: string
  next_best_move: string
  next_best_move_deadline_hint?: string
  reference_label: string
  reference_url?: string
  published_at: string
}

export interface Topic {
  id: string
  name: string
  service_line: ServiceLineId
  classification: 'Whitespace' | 'Popular' | 'Oversaturated'
  indegene_status: 'Active' | 'Gap'
  driven_by: string[]
  activity_trend: { period: string; value: number }[]
}

export interface AccountMetric {
  account_id: string
  service_line: ServiceLineId
  sources_scanned: number
  total_mentions: number
  competitors_active: number
  time_window: string
  share_of_voice_pct: number
  visibility_position: number
  activity_type_breakdown: { type: string; value: number }[]
}

export interface MarketExecutive {
  id: string
  account_id: string
  name: string
  title: string
  company: string
  location: string
  bio: string
  previous_companies: string[]
  focus_tags: string[]
}

export interface NextBestAction {
  id: string
  service_line: ServiceLineId
  source_card_id?: string
  headline: string
  recommendation_text: string
  priority: 'low' | 'medium' | 'high'
  status: 'new' | 'dismissed' | 'converted'
}

export const COMPETITOR_NAMES = [
  'ZS', 'IQVIA', 'Veeva', 'Accenture Life Sciences', 'Cognizant', 'EVERSANA', 'Axtria',
  'Publicis Health', 'Fishawack Health', 'Real Chemistry', 'Syneos Health', 'Trilogy Writing',
  'EPAM', 'Capgemini', 'Deloitte', 'ProPharma', 'Freyr Solutions', 'Envision Pharma',
]

const trend = (a: number, b: number, c: number, d: number) => [
  { period: 'Q1', value: a }, { period: 'Q2', value: b }, { period: 'Q3', value: c }, { period: 'Q4', value: d },
]

export const INTELLIGENCE_CARDS: IntelligenceCard[] = [
  {
    id: 'ic1', competitor: 'ZS', service_line: 'Omnichannel', tags: ['Product launch', 'AI'],
    headline: 'ZS launches ZAIDYN Content, extending its platform into compliant-content orchestration',
    summary: 'ZS announced ZAIDYN Content and ZAIDYN Medical, moving its proprietary platform beyond commercial analytics into content and medical-affairs workflows adjacent to omnichannel delivery.',
    what_this_means: 'ZS is building a platform moat around content operations — the exact territory where Company competes on integrated content supply and orchestration.',
    next_best_move: 'Position Company\'s content-supply-chain proof points (cycle time, MLR throughput) against a platform-only narrative in active omnichannel pursuits.',
    next_best_move_deadline_hint: 'Before Q3 renewal conversations',
    reference_label: 'ZS Insights', reference_url: 'https://www.zs.com/insights', published_at: '2026-05-19',
  },
  {
    id: 'ic2', competitor: 'IQVIA', service_line: 'DAAI', tags: ['Partnership', 'Data'],
    headline: 'IQVIA expands OCE + AI orchestration bundle for mid-size pharma',
    summary: 'IQVIA is packaging its data assets with agentic next-best-action tooling into a pre-integrated commercial bundle aimed at mid-size pharma commercial teams.',
    what_this_means: 'The data-plus-AI bundle competes directly with Company DAAI on accounts that value a single-vendor data spine.',
    next_best_move: 'Lead DAAI pursuits with governed-AI and content-activation differentiation rather than raw data breadth, where IQVIA is strongest.',
    reference_label: 'IQVIA Newsroom', published_at: '2026-06-02',
  },
  {
    id: 'ic3', competitor: 'Veeva', service_line: 'TechSolutions', tags: ['Platform integration'],
    headline: 'Veeva Vault CRM migration deadline accelerates platform-services demand',
    summary: 'With the Veeva-to-Vault CRM migration window tightening, demand for migration and integration services is spiking across large pharma.',
    what_this_means: 'A time-boxed, budgeted services surge that maps directly onto Company Tech Solutions.',
    next_best_move: 'Proactively scope Vault CRM migration readiness for Novartis and J&J, both mid-migration.',
    next_best_move_deadline_hint: 'Migration window closes H2 2026',
    reference_label: 'Veeva', published_at: '2026-06-10',
  },
  {
    id: 'ic4', competitor: 'EVERSANA', service_line: 'MLR', tags: ['Capability expansion'],
    headline: 'EVERSANA markets an AI-assisted MLR review accelerator',
    summary: 'EVERSANA is promoting an AI-assisted review workflow claiming materially faster MLR cycle times for promotional content.',
    what_this_means: 'MLR throughput is becoming a competitive battleground; buyers will increasingly ask for AI-assisted review SLAs.',
    next_best_move: 'Publish Company MLR cycle-time benchmarks with a governed-AI review narrative for GSK and Sanofi.',
    reference_label: 'EVERSANA', published_at: '2026-05-28',
  },
  {
    id: 'ic5', competitor: 'Axtria', service_line: 'DAAI', tags: ['Analyst recognition'],
    headline: 'Axtria named in analyst landscape for commercial data & AI',
    summary: 'Axtria earned inclusion in a commercial data-and-AI analyst landscape, reinforcing its positioning in field-suggestion and incentive-compensation analytics.',
    what_this_means: 'Axtria is strongest in field analytics; less visible in content activation — a seam for Company.',
    next_best_move: 'Differentiate on the analytics-to-content activation loop where Axtria has limited proof.',
    reference_label: 'Axtria', published_at: '2026-04-30',
  },
  {
    id: 'ic6', competitor: 'Publicis Health', service_line: 'Omnichannel', tags: ['Organisational change'],
    headline: 'Publicis Health consolidates agencies into an integrated model',
    summary: 'Publicis is consolidating its health agencies into a more integrated omnichannel proposition with a single P&L.',
    what_this_means: 'A stronger integrated-agency competitor for creative-led omnichannel mandates.',
    next_best_move: 'Emphasize regulated-content operations depth where a creative-agency model is thinner.',
    reference_label: 'Publicis', published_at: '2026-06-14',
  },
  {
    id: 'ic7', competitor: 'Fishawack Health', service_line: 'MedComm', tags: ['Customer announcement'],
    headline: 'Fishawack wins a multi-brand medical communications mandate',
    summary: 'Fishawack (Avalere Health) announced a multi-brand MedComm mandate spanning congress and publications.',
    what_this_means: 'Competitive pressure in MedComm at accounts prioritizing scientific-narrative depth.',
    next_best_move: 'Bundle MedComm with omnichannel activation to out-position a pure-play MedComm agency.',
    reference_label: 'Avalere Health', published_at: '2026-05-11',
  },
  {
    id: 'ic8', competitor: 'Freyr Solutions', service_line: 'Regulatory', tags: ['Capability expansion'],
    headline: 'Freyr promotes end-to-end regulatory operations with AI tracking',
    summary: 'Freyr is marketing an audit-ready, bot-monitored regulatory-tracking capability across submission lifecycle management.',
    what_this_means: 'Regulatory ops buyers will expect audit-ready automation as table stakes.',
    next_best_move: 'Lead Regulatory pursuits with lifecycle-management depth plus content interoperability, not tracking alone.',
    reference_label: 'Freyr', published_at: '2026-06-05',
  },
  {
    id: 'ic9', competitor: 'Accenture Life Sciences', service_line: 'TechSolutions', tags: ['Partnership', 'AI'],
    headline: 'Accenture + AWS extend life-sciences digital-health partnership',
    summary: 'Accenture deepened an AWS partnership targeting clinical and commercial digital-health platforms, including work distributed through AstraZeneca\'s Evinova.',
    what_this_means: 'A large-SI competitor is moving toward adjacent-to-regulatory digital-health automation.',
    next_best_move: 'Get into AstraZeneca technology conversations before SI-led automation expands into content/regulatory process.',
    next_best_move_deadline_hint: 'Technology entry window narrowing',
    reference_label: 'BioPharma Dive', published_at: '2026-03-22',
  },
  {
    id: 'ic10', competitor: 'Real Chemistry', service_line: 'DAAI', tags: ['AI', 'Product launch'],
    headline: 'Real Chemistry pushes AI-native audience intelligence',
    summary: 'Real Chemistry is marketing AI-native audience and content intelligence tying HCP signals to creative activation.',
    what_this_means: 'Creative-analytics convergence pressures the omnichannel-DAAI seam.',
    next_best_move: 'Show governed, compliant audience intelligence as the enterprise-grade alternative.',
    reference_label: 'Real Chemistry', published_at: '2026-05-20',
  },
  {
    id: 'ic11', competitor: 'Veeva', service_line: 'MLR', tags: ['Platform integration', 'AI'],
    headline: 'Veeva Vault adds auto-claims linking to speed MLR review',
    summary: 'Veeva is embedding automated claims-to-reference linking inside Vault PromoMats to cut manual matching during MLR review.',
    what_this_means: 'Platform-native MLR automation raises buyer expectations for review-cycle SLAs and audit trails.',
    next_best_move: 'Pair Company MLR operations with governed-AI claims linking so review depth is not traded for speed at GSK and Sanofi.',
    reference_label: 'Veeva', published_at: '2026-06-09',
  },
  {
    id: 'ic12', competitor: 'IQVIA', service_line: 'MLR', tags: ['Analyst recognition', 'Data'],
    headline: 'IQVIA layers compliance analytics onto promotional review',
    summary: 'IQVIA is marketing review analytics that flag high-risk promotional claims using its regulatory and safety data.',
    what_this_means: 'Data-led risk scoring in MLR is emerging as a differentiator buyers will ask about.',
    next_best_move: 'Lead with predictive MLR risk scoring as a service, not just a tool, where IQVIA sells data access.',
    reference_label: 'IQVIA', published_at: '2026-04-18',
  },
  {
    id: 'ic13', competitor: 'Envision Pharma', service_line: 'MedComm', tags: ['Product launch', 'AI'],
    headline: 'Envision scales AI-assisted publications planning',
    summary: 'Envision Pharma is extending its publications platform with AI-assisted planning and gap analysis across congresses.',
    what_this_means: 'Publications planning is professionalising fast; scientific-narrative depth alone is no longer a moat.',
    next_best_move: 'Bundle publications planning with omnichannel scientific activation for GSK medical teams.',
    reference_label: 'Envision Pharma', published_at: '2026-05-02',
  },
  {
    id: 'ic14', competitor: 'Real Chemistry', service_line: 'MedComm', tags: ['Partnership'],
    headline: 'Real Chemistry ties medical content to omnichannel audience data',
    summary: 'Real Chemistry is connecting medical communications output to HCP audience signals for tighter targeting.',
    what_this_means: 'The MedComm-to-omnichannel handoff is a contested seam where integrated delivery wins.',
    next_best_move: 'Show Company\'s single-team MedComm-to-omnichannel workflow as lower-friction than agency handoffs.',
    reference_label: 'Real Chemistry', published_at: '2026-06-01',
  },
  {
    id: 'ic15', competitor: 'ProPharma', service_line: 'Regulatory', tags: ['Capability expansion'],
    headline: 'ProPharma expands global regulatory-affairs managed services',
    summary: 'ProPharma is widening its managed regulatory-affairs footprint across submission lifecycle and medical information.',
    what_this_means: 'A managed-service model competes for the same regulatory-ops budget Company targets.',
    next_best_move: 'Differentiate on content interoperability between regulatory and commercial, where a pure managed-service is thinner.',
    reference_label: 'ProPharma', published_at: '2026-05-24',
  },
  {
    id: 'ic16', competitor: 'IQVIA', service_line: 'Regulatory', tags: ['Data', 'Partnership'],
    headline: 'IQVIA bundles regulatory submissions with real-world data',
    summary: 'IQVIA is packaging submission support with real-world evidence generation for post-approval commitments.',
    what_this_means: 'RWD-plus-submissions bundles pressure standalone regulatory providers on large-pharma accounts.',
    next_best_move: 'Position lifecycle regulatory depth plus content reuse against a data-anchored bundle at AstraZeneca and Novartis.',
    reference_label: 'IQVIA', published_at: '2026-03-30',
  },
  {
    id: 'ic17', competitor: 'Veeva', service_line: 'Omnichannel', tags: ['Platform integration'],
    headline: 'Veeva pushes Vault CRM + content module for unified engagement',
    summary: 'Veeva is promoting a tighter CRM-plus-content bundle to unify HCP engagement on a single platform.',
    what_this_means: 'A platform-first omnichannel narrative competes on data unity rather than content quality.',
    next_best_move: 'Lead with content-supply-chain throughput and modular reuse where a CRM-first story is weakest.',
    reference_label: 'Veeva', published_at: '2026-06-12',
  },
  {
    id: 'ic18', competitor: 'Cognizant', service_line: 'TechSolutions', tags: ['Capability expansion', 'AI'],
    headline: 'Cognizant markets a life-sciences commercial-platform modernization offer',
    summary: 'Cognizant is pitching platform modernization and integration services for commercial life-sciences estates.',
    what_this_means: 'A large-SI is targeting the same modernization budgets as Company Tech Solutions.',
    next_best_move: 'Differentiate on life-sciences content and regulatory context, not generic platform engineering.',
    reference_label: 'Cognizant', published_at: '2026-04-11',
  },
  {
    id: 'ic19', competitor: 'Accenture Life Sciences', service_line: 'DAAI', tags: ['AI', 'Product launch'],
    headline: 'Accenture launches an agentic commercial-AI accelerator',
    summary: 'Accenture is marketing an agentic accelerator for commercial next-best-action and content operations.',
    what_this_means: 'Agentic AI is becoming the default DAAI pitch; governance and compliance are the differentiators.',
    next_best_move: 'Anchor DAAI pursuits on governed, auditable agentic workflows rather than raw agent count.',
    reference_label: 'Accenture', published_at: '2026-05-15',
  },
  {
    id: 'ic20', competitor: 'EVERSANA', service_line: 'Omnichannel', tags: ['Capability expansion'],
    headline: 'EVERSANA integrates patient and HCP omnichannel under one model',
    summary: 'EVERSANA is bundling patient-services and HCP omnichannel into a single commercialization offer.',
    what_this_means: 'An end-to-end bundle competes with Company line-by-line at emerging and mid-cap accounts.',
    next_best_move: 'Win the lines where execution depth matters most and expose bundle lock-in risk at Sanofi.',
    reference_label: 'EVERSANA', published_at: '2026-06-07',
  },
]

export const TOPICS: Topic[] = [
  { id: 't1', name: 'Agentic next-best-action in the field', service_line: 'DAAI', classification: 'Popular', indegene_status: 'Active', driven_by: ['IQVIA', 'ZS', 'Axtria'], activity_trend: trend(40, 55, 72, 88) },
  { id: 't2', name: 'Governed enterprise AI for regulated content', service_line: 'DAAI', classification: 'Whitespace', indegene_status: 'Active', driven_by: ['ZS'], activity_trend: trend(10, 18, 26, 41) },
  { id: 't3', name: 'Generic HCP email personalization', service_line: 'Omnichannel', classification: 'Oversaturated', indegene_status: 'Active', driven_by: ['Publicis Health', 'Real Chemistry', 'EVERSANA'], activity_trend: trend(90, 88, 85, 80) },
  { id: 't4', name: 'Modular content & MLR-ready reuse', service_line: 'Omnichannel', classification: 'Popular', indegene_status: 'Active', driven_by: ['ZS', 'Fishawack Health'], activity_trend: trend(48, 60, 71, 79) },
  { id: 't5', name: 'AI-assisted MLR review acceleration', service_line: 'MLR', classification: 'Popular', indegene_status: 'Active', driven_by: ['EVERSANA', 'Veeva'], activity_trend: trend(30, 44, 58, 74) },
  { id: 't6', name: 'Predictive MLR risk scoring', service_line: 'MLR', classification: 'Whitespace', indegene_status: 'Gap', driven_by: [], activity_trend: trend(6, 9, 14, 22) },
  { id: 't7', name: 'Audit-ready regulatory tracking automation', service_line: 'Regulatory', classification: 'Popular', indegene_status: 'Active', driven_by: ['Freyr Solutions', 'ProPharma'], activity_trend: trend(35, 46, 55, 66) },
  { id: 't8', name: 'Cross-company co-marketing reg coordination', service_line: 'Regulatory', classification: 'Whitespace', indegene_status: 'Gap', driven_by: [], activity_trend: trend(5, 7, 11, 16) },
  { id: 't9', name: 'Congress & publications at scale', service_line: 'MedComm', classification: 'Oversaturated', indegene_status: 'Active', driven_by: ['Fishawack Health', 'Envision Pharma'], activity_trend: trend(82, 80, 79, 77) },
  { id: 't10', name: 'AI-drafted scientific narrative with human governance', service_line: 'MedComm', classification: 'Whitespace', indegene_status: 'Active', driven_by: ['ZS'], activity_trend: trend(8, 15, 24, 38) },
  { id: 't11', name: 'Veeva Vault CRM migration services', service_line: 'TechSolutions', classification: 'Popular', indegene_status: 'Active', driven_by: ['Veeva', 'Accenture Life Sciences', 'Cognizant'], activity_trend: trend(50, 66, 78, 91) },
  { id: 't12', name: 'Adjacent-to-regulatory digital-health automation', service_line: 'TechSolutions', classification: 'Whitespace', indegene_status: 'Gap', driven_by: ['Accenture Life Sciences'], activity_trend: trend(12, 20, 31, 44) },
  { id: 't13', name: 'Consent-first HCP journey orchestration', service_line: 'Omnichannel', classification: 'Whitespace', indegene_status: 'Active', driven_by: ['Veeva'], activity_trend: trend(9, 16, 25, 37) },
  { id: 't14', name: 'Manual claims-to-reference matching', service_line: 'MLR', classification: 'Oversaturated', indegene_status: 'Active', driven_by: ['Veeva', 'EVERSANA'], activity_trend: trend(78, 74, 70, 65) },
  { id: 't15', name: 'eCTD v4.0 submission readiness', service_line: 'Regulatory', classification: 'Popular', indegene_status: 'Active', driven_by: ['Freyr Solutions', 'ProPharma', 'IQVIA'], activity_trend: trend(28, 41, 57, 73) },
  { id: 't16', name: 'Omnichannel-linked medical content', service_line: 'MedComm', classification: 'Popular', indegene_status: 'Active', driven_by: ['Real Chemistry', 'ZS'], activity_trend: trend(24, 37, 49, 62) },
  { id: 't17', name: 'Legacy CRM lift-and-shift migration', service_line: 'TechSolutions', classification: 'Oversaturated', indegene_status: 'Active', driven_by: ['Cognizant', 'Capgemini'], activity_trend: trend(84, 82, 79, 75) },
  { id: 't18', name: 'Static segmentation dashboards', service_line: 'DAAI', classification: 'Oversaturated', indegene_status: 'Active', driven_by: ['Axtria', 'IQVIA'], activity_trend: trend(88, 85, 81, 77) },
  { id: 't19', name: 'Field-ready AI content compliance guardrails', service_line: 'MLR', classification: 'Whitespace', indegene_status: 'Active', driven_by: [], activity_trend: trend(7, 13, 21, 34) },
  { id: 't20', name: 'Real-world evidence for label expansion', service_line: 'Regulatory', classification: 'Popular', indegene_status: 'Gap', driven_by: ['IQVIA'], activity_trend: trend(33, 42, 51, 63) },
]

export const ACCOUNT_METRICS: AccountMetric[] = [
  { account_id: 'astrazeneca', service_line: 'Omnichannel', sources_scanned: 1420, total_mentions: 386, competitors_active: 9, time_window: 'Last 90 days', share_of_voice_pct: 22, visibility_position: 2, activity_type_breakdown: [{ type: 'Product launch', value: 34 }, { type: 'Partnership', value: 28 }, { type: 'Analyst recognition', value: 22 }, { type: 'Executive move', value: 16 }] },
  { account_id: 'gsk', service_line: 'MedComm', sources_scanned: 980, total_mentions: 214, competitors_active: 7, time_window: 'Last 90 days', share_of_voice_pct: 18, visibility_position: 3, activity_type_breakdown: [{ type: 'Congress', value: 40 }, { type: 'Publication', value: 30 }, { type: 'Partnership', value: 18 }, { type: 'Product launch', value: 12 }] },
  { account_id: 'jnj', service_line: 'DAAI', sources_scanned: 1610, total_mentions: 452, competitors_active: 11, time_window: 'Last 90 days', share_of_voice_pct: 26, visibility_position: 1, activity_type_breakdown: [{ type: 'AI', value: 38 }, { type: 'Partnership', value: 26 }, { type: 'Product launch', value: 20 }, { type: 'Analyst recognition', value: 16 }] },
  { account_id: 'novartis', service_line: 'DAAI', sources_scanned: 1180, total_mentions: 298, competitors_active: 8, time_window: 'Last 90 days', share_of_voice_pct: 20, visibility_position: 2, activity_type_breakdown: [{ type: 'AI', value: 33 }, { type: 'Data', value: 29 }, { type: 'Partnership', value: 22 }, { type: 'Product launch', value: 16 }] },
  { account_id: 'sanofi', service_line: 'Omnichannel', sources_scanned: 890, total_mentions: 187, competitors_active: 6, time_window: 'Last 90 days', share_of_voice_pct: 16, visibility_position: 4, activity_type_breakdown: [{ type: 'Product launch', value: 36 }, { type: 'Patient services', value: 30 }, { type: 'Partnership', value: 20 }, { type: 'Analyst recognition', value: 14 }] },
  { account_id: 'astrazeneca', service_line: 'DAAI', sources_scanned: 1240, total_mentions: 341, competitors_active: 10, time_window: 'Last 90 days', share_of_voice_pct: 19, visibility_position: 3, activity_type_breakdown: [{ type: 'AI', value: 40 }, { type: 'Partnership', value: 26 }, { type: 'Data', value: 20 }, { type: 'Product launch', value: 14 }] },
  { account_id: 'gsk', service_line: 'Omnichannel', sources_scanned: 760, total_mentions: 168, competitors_active: 6, time_window: 'Last 90 days', share_of_voice_pct: 15, visibility_position: 4, activity_type_breakdown: [{ type: 'Product launch', value: 32 }, { type: 'Partnership', value: 28 }, { type: 'Congress', value: 22 }, { type: 'Analyst recognition', value: 18 }] },
  { account_id: 'jnj', service_line: 'Omnichannel', sources_scanned: 1350, total_mentions: 402, competitors_active: 10, time_window: 'Last 90 days', share_of_voice_pct: 24, visibility_position: 1, activity_type_breakdown: [{ type: 'AI', value: 30 }, { type: 'Product launch', value: 28 }, { type: 'Partnership', value: 24 }, { type: 'Patient services', value: 18 }] },
  { account_id: 'novartis', service_line: 'TechSolutions', sources_scanned: 1010, total_mentions: 256, competitors_active: 8, time_window: 'Last 90 days', share_of_voice_pct: 17, visibility_position: 3, activity_type_breakdown: [{ type: 'Platform integration', value: 38 }, { type: 'Partnership', value: 26 }, { type: 'AI', value: 22 }, { type: 'Product launch', value: 14 }] },
  { account_id: 'sanofi', service_line: 'MedComm', sources_scanned: 640, total_mentions: 129, competitors_active: 5, time_window: 'Last 90 days', share_of_voice_pct: 13, visibility_position: 5, activity_type_breakdown: [{ type: 'Congress', value: 42 }, { type: 'Publication', value: 30 }, { type: 'Partnership', value: 16 }, { type: 'Product launch', value: 12 }] },
]

export const MARKET_EXECUTIVES: MarketExecutive[] = [
  { id: 'me-az-1', account_id: 'astrazeneca', name: 'Cristina Durán', title: 'President, Evinova (Chief Digital Health Officer)', company: 'AstraZeneca', location: 'Cambridge, UK', bio: 'Leads AstraZeneca\'s standalone digital-health subsidiary Evinova, distributing clinical-trial optimisation products through Accenture, AWS, Parexel and Fortrea.', previous_companies: ['AstraZeneca R&D'], focus_tags: ['Digital health', 'Clinical tech', 'Partnerships'] },
  { id: 'me-az-2', account_id: 'astrazeneca', name: 'Aradhana Sarin', title: 'Chief Financial Officer', company: 'AstraZeneca', location: 'Cambridge, UK', bio: 'CFO overseeing capital allocation across the $50B US manufacturing and $15B China R&D commitments; confirmed MFN pricing effects are built into guidance.', previous_companies: ['Alexion', 'Citi'], focus_tags: ['Capital allocation', 'Pricing policy'] },
  { id: 'me-gsk-1', account_id: 'gsk', name: 'Tony Wood', title: 'Chief Scientific Officer', company: 'GSK', location: 'London, UK', bio: 'Drives R&D strategy across vaccines and specialty medicines, with a growing emphasis on data-enabled medical strategy.', previous_companies: ['Pfizer'], focus_tags: ['R&D', 'Vaccines', 'Data strategy'] },
  { id: 'me-jnj-1', account_id: 'jnj', name: 'Jennifer Taubert', title: 'EVP, Worldwide Chairman, Innovative Medicine', company: 'Johnson & Johnson', location: 'New Jersey, US', bio: 'Leads the Innovative Medicine business with enterprise commitments to omnichannel and governed commercial AI.', previous_companies: ['Merck'], focus_tags: ['Commercial', 'Omnichannel', 'AI governance'] },
  { id: 'me-nvs-1', account_id: 'novartis', name: 'Victor Bultó', title: 'President, US', company: 'Novartis', location: 'New Jersey, US', bio: 'Leads the US business with a data-first commercial agenda and active CRM modernization.', previous_companies: ['Novartis Spain'], focus_tags: ['US commercial', 'CRM', 'Data-first'] },
  { id: 'me-snf-1', account_id: 'sanofi', name: 'Julie Van Ongevalle', title: 'EVP, Chief Marketing & Digital Officer', company: 'Sanofi', location: 'Paris, FR', bio: 'Leads the "Play to Win" digital and omnichannel agenda, prioritizing field AI adoption and vendor rationalization.', previous_companies: ['Estée Lauder'], focus_tags: ['Digital', 'Omnichannel', 'AI adoption'] },
  { id: 'me-az-3', account_id: 'astrazeneca', name: 'Ruud Dobber', title: 'EVP & President, BioPharmaceuticals Business Unit', company: 'AstraZeneca', location: 'Gaithersburg, US', bio: 'Runs the BioPharmaceuticals commercial business, with launch-heavy omnichannel programmes across cardiovascular, renal, respiratory and immunology.', previous_companies: ['AstraZeneca Europe'], focus_tags: ['Commercial', 'Launch', 'Omnichannel'] },
  { id: 'me-gsk-2', account_id: 'gsk', name: 'Luke Miels', title: 'Chief Commercial Officer', company: 'GSK', location: 'London, UK', bio: 'Owns global commercial strategy across vaccines and specialty medicines, pushing content-supply-chain efficiency and MLR throughput.', previous_companies: ['AstraZeneca'], focus_tags: ['Commercial', 'MLR', 'Content ops'] },
  { id: 'me-gsk-3', account_id: 'gsk', name: 'Shobie Ramakrishnan', title: 'Chief Digital & Technology Officer', company: 'GSK', location: 'London, UK', bio: 'Leads digital and technology, modernizing commercial platforms and governed enterprise AI for regulated content.', previous_companies: ['Genentech'], focus_tags: ['Digital', 'Governed AI', 'Platforms'] },
  { id: 'me-jnj-2', account_id: 'jnj', name: 'Jim Swanson', title: 'EVP & Chief Information Officer', company: 'Johnson & Johnson', location: 'New Jersey, US', bio: 'Runs enterprise technology, prioritizing commercial platform modernization and governed AI across Innovative Medicine.', previous_companies: ['Marsh McLennan', 'Monsanto'], focus_tags: ['Tech Solutions', 'AI governance', 'Platforms'] },
  { id: 'me-jnj-3', account_id: 'jnj', name: 'Kirk Shepard', title: 'Chief Medical Officer, Innovative Medicine', company: 'Johnson & Johnson', location: 'New Jersey, US', bio: 'Leads medical strategy and scientific communications across the Innovative Medicine portfolio.', previous_companies: ['Eisai'], focus_tags: ['MedComm', 'Medical strategy', 'Congress'] },
  { id: 'me-nvs-2', account_id: 'novartis', name: 'Robert Kowalski', title: 'Chief Medical Officer', company: 'Novartis', location: 'Basel, CH', bio: 'Owns global medical affairs and scientific engagement, with a data-first approach to medical content.', previous_companies: ['Novartis Global Drug Development'], focus_tags: ['MedComm', 'Medical affairs', 'Data-first'] },
  { id: 'me-nvs-3', account_id: 'novartis', name: 'Shannon Klinger', title: 'Chief Operating Officer', company: 'Novartis', location: 'Basel, CH', bio: 'Drives operational execution and vendor governance across the commercial and CRM modernization agenda.', previous_companies: ['Novartis Legal'], focus_tags: ['Operations', 'CRM', 'Vendor governance'] },
  { id: 'me-snf-2', account_id: 'sanofi', name: 'Emmanuel Frenehard', title: 'Chief Digital Officer', company: 'Sanofi', location: 'Paris, FR', bio: 'Leads the digital core of "Play to Win", scaling AI adoption and governed content platforms across markets.', previous_companies: ['Amgen'], focus_tags: ['Digital', 'AI adoption', 'Governed content'] },
  { id: 'me-snf-3', account_id: 'sanofi', name: 'Houman Ashrafian', title: 'EVP, Head of R&D', company: 'Sanofi', location: 'Cambridge, US', bio: 'Runs R&D with growing emphasis on regulatory-science automation and evidence generation for launches.', previous_companies: ['Novartis', 'GSK'], focus_tags: ['R&D', 'Regulatory science', 'Evidence'] },
]

export const NEXT_BEST_ACTIONS: NextBestAction[] = [
  { id: 'nba1', service_line: 'Omnichannel', source_card_id: 'ic1', headline: 'Counter ZAIDYN Content with a content-supply-chain proof pack', recommendation_text: 'Assemble Company MLR-throughput and cycle-time benchmarks into a leave-behind for active AstraZeneca and Sanofi omnichannel pursuits before Q3 renewals.', priority: 'high', status: 'new' },
  { id: 'nba2', service_line: 'TechSolutions', source_card_id: 'ic3', headline: 'Scope Veeva Vault CRM migration readiness for Novartis & J&J', recommendation_text: 'Both accounts are mid-migration with a closing window — proactively scope a migration-readiness assessment.', priority: 'high', status: 'new' },
  { id: 'nba3', service_line: 'MLR', source_card_id: 'ic4', headline: 'Publish governed-AI MLR review benchmarks for GSK & Sanofi', recommendation_text: 'EVERSANA is setting an AI-review SLA narrative; respond with Company\'s governed-AI review benchmarks.', priority: 'medium', status: 'new' },
  { id: 'nba4', service_line: 'TechSolutions', source_card_id: 'ic9', headline: 'Enter AstraZeneca technology conversations ahead of SI-led automation', recommendation_text: 'Accenture/AWS momentum in adjacent-to-regulatory digital health is narrowing the entry window — request a technology discovery session.', priority: 'high', status: 'new' },
  { id: 'nba5', service_line: 'MedComm', source_card_id: 'ic7', headline: 'Bundle MedComm + omnichannel activation vs pure-play agencies', recommendation_text: 'Position integrated activation where Fishawack competes on scientific depth alone.', priority: 'medium', status: 'new' },
  { id: 'nba6', service_line: 'Regulatory', source_card_id: 'ic8', headline: 'Lead Regulatory pursuits with lifecycle depth + content interoperability', recommendation_text: 'Differentiate from Freyr\'s tracking-automation message with end-to-end lifecycle and content interoperability.', priority: 'low', status: 'new' },
  { id: 'nba7', service_line: 'MLR', source_card_id: 'ic11', headline: 'Package governed-AI claims linking as an MLR accelerator', recommendation_text: 'Veeva and IQVIA are setting AI-review expectations — bundle governed-AI claims linking with human review SLAs for GSK and Sanofi.', priority: 'high', status: 'new' },
  { id: 'nba8', service_line: 'MedComm', source_card_id: 'ic13', headline: 'Win publications planning with MedComm + omnichannel activation', recommendation_text: 'Envision and Real Chemistry are professionalizing publications — counter with an integrated planning-to-activation workflow at GSK and J&J.', priority: 'medium', status: 'new' },
  { id: 'nba9', service_line: 'Regulatory', source_card_id: 'ic16', headline: 'Answer RWD-plus-submissions bundles with lifecycle + content reuse', recommendation_text: 'IQVIA is bundling submissions with real-world evidence — position lifecycle regulatory depth plus commercial content reuse at AstraZeneca and Novartis.', priority: 'medium', status: 'new' },
]

export const cardsForServiceLine = (sl: string | null) =>
  sl ? INTELLIGENCE_CARDS.filter(c => c.service_line === sl) : INTELLIGENCE_CARDS
export const metricsForAccount = (accountId: string) =>
  ACCOUNT_METRICS.filter(m => m.account_id === accountId)
export const execsForAccount = (accountId: string) =>
  MARKET_EXECUTIVES.filter(e => e.account_id === accountId)

// ─── SOURCE LINKS ─────────────────────────────────────────────────────────────
// Every card exposes a source. Competitor/company homepages + a house market-scan ref.
export const COMPETITOR_SITE: Record<string, string> = {
  'ZS': 'https://www.zs.com', 'IQVIA': 'https://www.iqvia.com', 'Veeva': 'https://www.veeva.com',
  'Accenture Life Sciences': 'https://www.accenture.com/us-en/industries/life-sciences', 'Cognizant': 'https://www.cognizant.com',
  'EVERSANA': 'https://www.eversana.com', 'Axtria': 'https://www.axtria.com', 'Publicis Health': 'https://www.publicishealth.com',
  'Fishawack Health': 'https://avalerehealth.com', 'Real Chemistry': 'https://www.realchemistry.com', 'Syneos Health': 'https://www.syneoshealth.com',
  'Trilogy Writing': 'https://www.trilogywriting.com', 'EPAM': 'https://www.epam.com', 'Capgemini': 'https://www.capgemini.com',
  'Deloitte': 'https://www.deloitte.com', 'ProPharma': 'https://www.propharmagroup.com', 'Freyr Solutions': 'https://www.freyrsolutions.com',
  'Envision Pharma': 'https://www.envisionpharmagroup.com',
}
const COMPANY_SITE: Record<string, string> = {
  'AstraZeneca': 'https://www.astrazeneca.com/our-company/our-leadership.html',
  'GSK': 'https://www.gsk.com/en-gb/company/our-leadership-team/',
  'Johnson & Johnson': 'https://www.jnj.com/leadership',
  'Novartis': 'https://www.novartis.com/about/leadership',
  'Sanofi': 'https://www.sanofi.com/en/about-us/governance',
}
const HOUSE_SOURCE = { label: 'Company Market Scan', url: 'https://www.indegene.com/what-we-think' }

export const cardSource = (c: IntelligenceCard) => ({ label: c.reference_label, url: c.reference_url ?? COMPETITOR_SITE[c.competitor] ?? HOUSE_SOURCE.url })
export const topicSource = (t: Topic) => t.driven_by[0]
  ? { label: t.driven_by[0], url: COMPETITOR_SITE[t.driven_by[0]] ?? HOUSE_SOURCE.url }
  : HOUSE_SOURCE
export const execSource = (e: MarketExecutive) => ({ label: `${e.company} leadership`, url: COMPANY_SITE[e.company] ?? HOUSE_SOURCE.url })
export const nbaSource = (n: NextBestAction) => {
  const c = n.source_card_id ? INTELLIGENCE_CARDS.find(x => x.id === n.source_card_id) : undefined
  return c ? cardSource(c) : HOUSE_SOURCE
}
