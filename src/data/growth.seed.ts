// ─── GROWTH (SALES & GROWTH INTELLIGENCE) SEED ────────────────────────────────
// Re-keyed from the source Freyr-branded demo to Company serving the 5 core
// pharma accounts (master §1.1 / §9.1). External News is account-aware (§9.1 fix).

export interface NewsItem {
  id: string
  account_id: string | null
  title: string
  source: string
  published_at: string
  summary: string
  tag: string
  url?: string
}

export interface InsightCard {
  id: string
  kind: 'opportunity' | 'risk' | 'signal'
  title: string
  body: string
  account_id?: string
  metric?: string
}

export interface PipelineDeal {
  id: string
  account_id: string
  name: string
  service_line: string
  stage: 'Qualify' | 'Discover' | 'Propose' | 'Negotiate' | 'ClosedWon'
  acv: number
  tcv: number
  forecast: 'Commit' | 'BestCase' | 'Pipeline'
  close_quarter: string
  owner: string
}

export interface RevenuePoint { period: string; revenue: number; target: number }

export const NEWS: NewsItem[] = [
  { id: 'n1', account_id: 'astrazeneca', title: 'AstraZeneca commits $15B to expand China R&D', source: 'Reuters', published_at: '2026-01-20', tag: 'Investment', summary: 'A major China R&D capacity expansion that materially increases NMPA submission volume — a fresh, dated regulatory-operations opportunity.' },
  { id: 'n2', account_id: 'astrazeneca', title: 'Imfinzi gastric/GEJ indication approved in the EU', source: 'AstraZeneca', published_at: '2026-03-14', tag: 'Approval', summary: 'Label expansion drives a multi-market omnichannel localization and MLR workload ahead of a major GI oncology congress.' },
  { id: 'n3', account_id: 'novartis', title: 'Novartis accelerates Veeva Vault CRM migration', source: 'FiercePharma', published_at: '2026-05-08', tag: 'Technology', summary: 'A time-boxed platform-services surge aligned to Company Tech Solutions.' },
  { id: 'n4', account_id: 'jnj', title: 'J&J issues enterprise governed-AI mandate for commercial', source: 'Endpoints', published_at: '2026-04-11', tag: 'AI Governance', summary: 'A commercial AI-governance mandate creates demand for governed-AI pilot review and DAAI advisory.' },
  { id: 'n5', account_id: 'gsk', title: 'GSK expands Shingrix comorbid-population strategy', source: 'GSK', published_at: '2026-06-02', tag: 'Commercial', summary: 'Segmented HCP strategy expands omnichannel and medical-analytics content demand.' },
  { id: 'n6', account_id: 'sanofi', title: 'Sanofi "Play to Win" pushes field AI adoption', source: 'Sanofi', published_at: '2026-05-19', tag: 'Transformation', summary: 'Efficiency mandate driving vendor rationalization and field change-management enablement demand.' },
  { id: 'n7', account_id: null, title: 'Pharma commercial AI spend to grow 24% in 2026', source: 'IQVIA Institute', published_at: '2026-02-28', tag: 'Market', summary: 'Sector-wide DAAI budget expansion underpins the platform-wide growth thesis.' },
  { id: 'n8', account_id: null, title: 'Veeva Vault CRM migration window tightens across large pharma', source: 'Veeva', published_at: '2026-06-10', tag: 'Market', summary: 'A budgeted, time-boxed services surge across multiple accounts.' },
  { id: 'n9', account_id: 'sanofi', title: 'Sanofi advances Dupixent into new indications', source: 'Sanofi', published_at: '2026-04-22', tag: 'Approval', summary: 'New indications expand patient-services and omnichannel content scope.' },
  { id: 'n10', account_id: 'jnj', title: 'J&J readies ICOTYDE launch field enablement', source: 'Endpoints', published_at: '2026-06-01', tag: 'Launch', summary: 'A priority launch driving field-enablement content demand at scale.' },
]

export const INSIGHTS: InsightCard[] = [
  { id: 'g-i1', kind: 'opportunity', title: 'China NMPA capacity surge at AstraZeneca', account_id: 'astrazeneca', metric: '$15B R&D expansion', body: 'The January 2026 China R&D commitment created a dated, bounded regulatory-operations opportunity. AstraZeneca\'s incremental China regulatory vendor panel is plausibly still forming — a clean entry point for Regulatory + DAAI.' },
  { id: 'g-i2', kind: 'opportunity', title: 'Veeva Vault CRM migration window', account_id: 'novartis', metric: 'Closes H2 2026', body: 'Novartis and J&J are mid-migration against a closing deadline — a budgeted Tech Solutions surge. Proactively scope migration-readiness before the window shuts.' },
  { id: 'g-i3', kind: 'risk', title: 'SI-led automation encroaching at AstraZeneca', account_id: 'astrazeneca', metric: 'Entry window narrowing', body: 'Accenture/AWS momentum in adjacent-to-regulatory digital health (via Evinova) risks foreclosing the technology entry window. Get into technology conversations this quarter.' },
  { id: 'g-i4', kind: 'signal', title: 'Governed-AI demand accelerating', metric: '+24% AI spend', body: 'Enterprise AI-governance mandates (J&J) plus sector-wide commercial-AI budget growth make governed-AI the strongest cross-account DAAI wedge in 2026.' },
  { id: 'g-i5', kind: 'opportunity', title: 'Sanofi vendor rationalization opening', account_id: 'sanofi', metric: '"Play to Win"', body: 'The efficiency mandate rationalizes vendors — an opening for an integrated MedComm + Omnichannel single-partner proposition that reduces Sanofi\'s vendor count.' },
  { id: 'g-i6', kind: 'signal', title: 'MLR throughput is the new battleground', metric: 'AI review SLAs', body: 'Competitors are marketing AI-assisted MLR acceleration. Publishing governed-AI review benchmarks protects GSK and Sanofi MedComm/MLR renewals.' },
]

export const PIPELINE: PipelineDeal[] = [
  { id: 'd1', account_id: 'astrazeneca', name: 'China NMPA Regulatory Operations Expansion', service_line: 'Regulatory', stage: 'Discover', acv: 2400, tcv: 7200, forecast: 'BestCase', close_quarter: 'Q4 2026', owner: 'Ritesh Dogra' },
  { id: 'd2', account_id: 'astrazeneca', name: 'Imfinzi GEJ Omnichannel Launch Support', service_line: 'Omnichannel', stage: 'Negotiate', acv: 1800, tcv: 3600, forecast: 'Commit', close_quarter: 'Q3 2026', owner: 'Ritesh Dogra' },
  { id: 'd3', account_id: 'novartis', name: 'Veeva Vault CRM Migration Services', service_line: 'TechSolutions', stage: 'Propose', acv: 2100, tcv: 4200, forecast: 'BestCase', close_quarter: 'Q3 2026', owner: 'Meera Rao' },
  { id: 'd4', account_id: 'jnj', name: 'Commercial Governed-AI Advisory & Pilot Review', service_line: 'DAAI', stage: 'Discover', acv: 1500, tcv: 4500, forecast: 'Pipeline', close_quarter: 'Q4 2026', owner: 'Meera Rao' },
  { id: 'd5', account_id: 'gsk', name: 'Shingrix Comorbid Omnichannel + Analytics', service_line: 'Omnichannel', stage: 'Qualify', acv: 900, tcv: 1800, forecast: 'Pipeline', close_quarter: 'Q1 2027', owner: 'Ritesh Dogra' },
  { id: 'd6', account_id: 'sanofi', name: 'Integrated MedComm + Omnichannel Consolidation', service_line: 'MedComm', stage: 'Propose', acv: 1300, tcv: 3900, forecast: 'BestCase', close_quarter: 'Q4 2026', owner: 'Ritesh Dogra' },
  { id: 'd7', account_id: 'jnj', name: 'MLR Review Capacity Scaling Platform', service_line: 'MLR', stage: 'Negotiate', acv: 1100, tcv: 2200, forecast: 'Commit', close_quarter: 'Q3 2026', owner: 'Meera Rao' },
  { id: 'd8', account_id: 'sanofi', name: 'Field AI Adoption Change-Management', service_line: 'DAAI', stage: 'ClosedWon', acv: 700, tcv: 1400, forecast: 'Commit', close_quarter: 'Q2 2026', owner: 'Ritesh Dogra' },
  { id: 'd9', account_id: 'novartis', name: 'Entresto Lifecycle Brand-Defense Program', service_line: 'Omnichannel', stage: 'ClosedWon', acv: 1000, tcv: 2000, forecast: 'Commit', close_quarter: 'Q2 2026', owner: 'Meera Rao' },
  { id: 'd10', account_id: 'astrazeneca', name: 'Alexion Rare-Disease Reg Content Migration', service_line: 'Regulatory', stage: 'ClosedWon', acv: 850, tcv: 1700, forecast: 'Commit', close_quarter: 'Q1 2026', owner: 'Ritesh Dogra' },
]

export const REVENUE_TREND: RevenuePoint[] = [
  { period: 'Q1 25', revenue: 9.8, target: 10 },
  { period: 'Q2 25', revenue: 10.6, target: 10.5 },
  { period: 'Q3 25', revenue: 11.2, target: 11 },
  { period: 'Q4 25', revenue: 12.1, target: 11.8 },
  { period: 'Q1 26', revenue: 12.9, target: 12.5 },
  { period: 'Q2 26', revenue: 13.7, target: 13.4 },
]

export const STAGES: PipelineDeal['stage'][] = ['Qualify', 'Discover', 'Propose', 'Negotiate', 'ClosedWon']
export const newsForAccount = (accountId: string | null) =>
  accountId ? NEWS.filter(n => n.account_id === accountId || n.account_id === null) : NEWS
