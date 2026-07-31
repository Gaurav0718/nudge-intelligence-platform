// ─── SHARED PLATFORM DATA (single source of truth, imported everywhere) ───────
// Per master spec §7 / §3.1. Accounts, Users, Service Lines used by 2+ modules.

export type ServiceLineId =
  | 'DAAI' | 'MedComm' | 'MLR' | 'Omnichannel' | 'Regulatory' | 'TechSolutions'

export const SERVICE_LINES: { id: ServiceLineId; label: string }[] = [
  { id: 'DAAI',          label: 'DAAI' },
  { id: 'MedComm',       label: 'MedComm' },
  { id: 'MLR',           label: 'MLR' },
  { id: 'Omnichannel',   label: 'Omnichannel' },
  { id: 'Regulatory',    label: 'Regulatory' },
  { id: 'TechSolutions', label: 'Tech Solutions' },
]

export interface PlatformUser {
  id: string; email: string; display_name: string; initials: string; role: string
}

export const USERS: PlatformUser[] = [
  { id: 'u-ritesh', email: 'ritesh.dogra@indegene.com', display_name: 'Ritesh Dogra', initials: 'RD', role: 'Account Director' },
  { id: 'u-priya',  email: 'priya.nair@indegene.com',   display_name: 'Priya Nair',   initials: 'PN', role: 'Delivery Lead' },
  { id: 'u-arjun',  email: 'arjun.mehta@indegene.com',  display_name: 'Arjun Mehta',  initials: 'AM', role: 'Delivery Lead' },
  { id: 'u-sara',   email: 'sara.khan@indegene.com',    display_name: 'Sara Khan',    initials: 'SK', role: 'Engagement Manager' },
  { id: 'u-david',  email: 'david.lee@indegene.com',    display_name: 'David Lee',    initials: 'DL', role: 'Portfolio Head' },
  { id: 'u-meera',  email: 'meera.rao@indegene.com',    display_name: 'Meera Rao',    initials: 'MR', role: 'Strategy Lead' },
  { id: 'u-tom',    email: 'tom.fisher@indegene.com',   display_name: 'Tom Fisher',   initials: 'TF', role: 'Marketing Lead' },
]

export interface CoreAccount {
  id: string
  name: string
  logo_letter: string
  accent_color: string
  is_core_demo_account: boolean
  posture_label: string
  strategic_posture_text: string
  current_revenue?: string
  three_year_target?: string
  portfolio_head?: string
  account_owner?: string
}

// The 5 fully-seeded core demo accounts (all four modules go deep on these)
export const CORE_ACCOUNTS: CoreAccount[] = [
  {
    id: 'astrazeneca', name: 'AstraZeneca', logo_letter: 'A', accent_color: '#7A1F3D',
    is_core_demo_account: true, posture_label: 'Strategic Priority',
    strategic_posture_text: 'Global oncology & respiratory leader consolidating commercial vendors around governed AI. Heavy omnichannel launch programme; regulatory volume rising across concurrent filings.',
    current_revenue: '$14.2M', three_year_target: '$22M', portfolio_head: 'David Lee', account_owner: 'Ritesh Dogra',
  },
  {
    id: 'gsk', name: 'GSK', logo_letter: 'G', accent_color: '#F36633',
    is_core_demo_account: true, posture_label: 'Focused Growth',
    strategic_posture_text: 'Vaccines & specialty medicines. Expanding MedComm and MLR footprint; scrutiny on content supply-chain cycle times and compliance throughput.',
    current_revenue: '$9.6M', three_year_target: '$16M', portfolio_head: 'David Lee', account_owner: 'Ritesh Dogra',
  },
  {
    id: 'jnj', name: 'Johnson & Johnson', logo_letter: 'J', accent_color: '#C8102E',
    is_core_demo_account: true, posture_label: 'Strategic Priority',
    strategic_posture_text: 'Diversified pharma & MedTech. Enterprise omnichannel and DAAI investment; strong multi-service relationship with headroom in Regulatory.',
    current_revenue: '$18.1M', three_year_target: '$28M', portfolio_head: 'Meera Rao', account_owner: 'Ritesh Dogra',
  },
  {
    id: 'novartis', name: 'Novartis', logo_letter: 'N', accent_color: '#0460A9',
    is_core_demo_account: true, posture_label: 'Expansion',
    strategic_posture_text: 'Data-first pharma prioritising DAAI and omnichannel personalisation. Active content-production and video RFPs; margin pressure on delivery.',
    current_revenue: '$11.3M', three_year_target: '$19M', portfolio_head: 'Meera Rao', account_owner: 'Ritesh Dogra',
  },
  {
    id: 'sanofi', name: 'Sanofi', logo_letter: 'S', accent_color: '#7A00E6',
    is_core_demo_account: true, posture_label: 'Focused Growth',
    strategic_posture_text: 'Immunology & vaccines. "Play to Win" efficiency mandate driving vendor rationalisation; opportunity in integrated MedComm + Omnichannel.',
    current_revenue: '$8.9M', three_year_target: '$15M', portfolio_head: 'David Lee', account_owner: 'Ritesh Dogra',
  },
]

// Long-tail accounts — selectable everywhere, lightly seeded (name/logo/one-line posture)
export const LONGTAIL_ACCOUNTS: CoreAccount[] = [
  { id: 'astellas',   name: 'Astellas',             logo_letter: 'A', accent_color: '#E4002B', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'Oncology & specialty; emerging omnichannel interest.' },
  { id: 'bayer',      name: 'Bayer',                logo_letter: 'B', accent_color: '#10384F', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'Broad pharma & consumer health; selective engagement.' },
  { id: 'biogen',     name: 'Biogen',               logo_letter: 'B', accent_color: '#1E22AA', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'Neuroscience-focused; regulatory-heavy portfolio.' },
  { id: 'boehringer', name: 'Boehringer Ingelheim', logo_letter: 'B', accent_color: '#00617F', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'Family-owned; cardio-metabolic and respiratory.' },
  { id: 'daiichi',    name: 'Daiichi Sankyo',       logo_letter: 'D', accent_color: '#C8102E', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'ADC oncology leader; expanding global commercial ops.' },
  { id: 'gilead',     name: 'Gilead',               logo_letter: 'G', accent_color: '#C8102E', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'Virology & oncology; digital engagement build-out.' },
  { id: 'novonordisk',name: 'Novo Nordisk',         logo_letter: 'N', accent_color: '#001965', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'Cardiometabolic scale-up; high omnichannel demand.' },
  { id: 'takeda',     name: 'Takeda',               logo_letter: 'T', accent_color: '#E4002B', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'Global restructuring; concurrent launch programme.' },
  { id: 'vertex',     name: 'Vertex',               logo_letter: 'V', accent_color: '#00A3E0', is_core_demo_account: false, posture_label: 'Monitor', strategic_posture_text: 'CF franchise plus pipeline diversification.' },
]

export const ALL_ACCOUNTS: CoreAccount[] = [...CORE_ACCOUNTS, ...LONGTAIL_ACCOUNTS]

export const accountById = (id: string) => ALL_ACCOUNTS.find(a => a.id === id)
export const serviceLineLabel = (id: string) =>
  SERVICE_LINES.find(s => s.id === id)?.label ?? id

// ─── MODULES GRID (master §2.1) ───────────────────────────────────────────────
export const MODULES = [
  { id: 'sales',    title: 'Sales & Growth Intelligence', desc: 'Monitor revenue streams, pipeline health, and high-value growth opportunities across global markets.',                 icon: 'TrendingUp',  status: 'active' as const, path: '/executive-summary' },
  { id: 'mktg',     title: 'Marketing & Service Line',    desc: 'Deep analytics into service line penetration and efficacy of integrated marketing campaigns on brand positioning.',    icon: 'BarChart3',   status: 'active' as const, path: '/marketing' },
  { id: 'delivery', title: 'Delivery Health',             desc: 'Real-time oversight of project execution, SLA compliance, and operational excellence across the organization.',      icon: 'CheckCircle2',status: 'active' as const, path: '/delivery-health' },
  { id: 'compete',  title: 'Competition Module',          desc: 'Strategic tracking of competitor movement, market share shifts, and disruptive industry trends.',                    icon: 'Target',      status: 'active' as const, path: '/competition' },
  { id: 'talent',   title: 'Talent Internal Health',      desc: 'Insights into organizational culture, retention patterns, and internal skill mapping for strategic planning.',         icon: 'Users',       status: 'soon' as const },
  { id: 'rfp',      title: 'RFI / RFP Intelligence',      desc: 'Centralized hub for proposal tracking, bid win-loss analysis, and response lifecycle optimization.',                  icon: 'FileText',    status: 'soon' as const },
]
