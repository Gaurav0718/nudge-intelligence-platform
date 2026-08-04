// Keyword → intent knowledge base for the in-platform AI assistant.
// Each intent carries: matching keywords, a reply, navigation actions and the
// documents (dossiers / research artifacts) it points to.

export interface ChatAction {
  label: string
  path: string
  desc?: string
}

export interface ChatDoc {
  label: string
  path: string
  desc: string
}

export interface ChatIntent {
  id: string
  keywords: string[]
  reply: string
  actions?: ChatAction[]
  docs?: ChatDoc[]
  chips?: string[]
}

export const ACCOUNTS: { keys: string[]; id: string; name: string; path: string }[] = [
  { keys: ['astrazeneca', 'astra zenecca', 'az', 'astrazenca'], id: 'astrazeneca', name: 'AstraZeneca', path: '/accounts/astrazeneca' },
  { keys: ['gsk', 'glaxo'], id: 'gsk', name: 'GSK', path: '/accounts/gsk' },
  { keys: ['jnj', 'johnson', 'j&j', 'j and j', 'johnson and johnson'], id: 'jnj', name: 'Johnson & Johnson', path: '/accounts/jnj' },
  { keys: ['sanofi', 'snf'], id: 'sanofi', name: 'Sanofi', path: '/accounts/sanofi' },
  { keys: ['novartis', 'nvs', 'novartus'], id: 'novartis', name: 'Novartis', path: '/accounts/novartis' },
]

export const INTENTS: ChatIntent[] = [
  {
    id: 'home',
    keywords: ['home', 'main page', 'landing', 'executive war room', 'headline', 'dashboard home'],
    reply: 'The Home page is the executive war room — it consolidates signals, winning/losing posture, Next Best Actions, the opportunity radar and missed opportunities across all five accounts.',
    actions: [{ label: 'Open Home', path: '/', desc: 'Organization-level executive intelligence' }],
  },
  {
    id: 'modules',
    keywords: ['modules', 'all modules', 'module list', 'what modules'],
    reply: 'All modules are listed on the Modules page: Sales & Growth, Marketing & Service Line, Delivery Health, Competition, and the cross-module Account Intelligence section.',
    actions: [{ label: 'Open Modules', path: '/modules', desc: 'Browse every intelligence module' }],
  },
  {
    id: 'accounts',
    keywords: ['accounts', 'account list', 'all accounts', 'dossiers', 'account intelligence'],
    reply: 'Account Intelligence holds the five client dossiers (AstraZeneca, GSK, Johnson & Johnson, Sanofi, Novartis) with exec capital, planning and consolidated views.',
    actions: [
      { label: 'Open Accounts', path: '/accounts', desc: 'Five client dossiers' },
      { label: 'Consolidated Overview', path: '/overview', desc: 'Cross-account portfolio view' },
    ],
  },
  {
    id: 'competition',
    keywords: ['competition', 'competitor', 'competitors', 'competitive', 'iqvia', 'accelity', 'evinova'],
    reply: 'The Competition module tracks competitor movement, market-share shifts and strategic moves, with a signal feed and a strategic radar.',
    actions: [
      { label: 'Competitors', path: '/competition', desc: 'Competitor list and profiles' },
      { label: 'Signal Feed', path: '/competition/signals', desc: 'Live competitive signals' },
      { label: 'Strategic Radar', path: '/competition/radar', desc: 'Positioning and next-best steps' },
    ],
  },
  {
    id: 'delivery',
    keywords: ['delivery', 'delivery health', 'projects', 'project', 'sla', 'milestones', 'interventions', 'account health'],
    reply: 'Delivery Health covers project execution, SLA compliance, account health and interventions across the portfolio.',
    actions: [
      { label: 'Delivery Dashboard', path: '/delivery-health', desc: 'Operational health overview' },
      { label: 'Projects', path: '/delivery-health/projects', desc: 'Project execution and SLAs' },
      { label: 'Account Health', path: '/delivery-health/accounts', desc: 'Delivery status by account' },
      { label: 'Interventions', path: '/delivery-health/actions', desc: 'Escalations and interventions' },
    ],
  },
  {
    id: 'growth',
    keywords: ['sales', 'growth', 'pipeline', 'financial insights', 'revenue', 'acv', 'tcv', 'forecast', 'win rate', 'momentum'],
    reply: 'Sales & Growth holds internal news, external news, pipeline insights and financial insights for the account universe.',
    actions: [
      { label: 'Internal News', path: '/executive-summary', desc: 'Company and client updates' },
      { label: 'External News', path: '/executive-summary/external-news', desc: 'Market news per account' },
      { label: 'Pipeline Insights', path: '/executive-summary/pipeline-insights', desc: 'ACV/TCV, stages, forecasts' },
      { label: 'Financial Insights', path: '/executive-summary/financial-insights', desc: 'Quarterly financial trends' },
    ],
  },
  {
    id: 'marketing',
    keywords: ['marketing', 'service line', 'market pulse', 'account pulse', 'execution workspace'],
    reply: 'Marketing & Service Line covers market pulse, account pulse, Next Best Action, execution workspace and the internal Company hub.',
    actions: [
      { label: 'Market Pulse', path: '/marketing/market-pulse', desc: 'Market and service-line signals' },
      { label: 'Account Pulse', path: '/marketing/account-pulse', desc: 'Service-line penetration per account' },
      { label: 'Next Best Action', path: '/marketing/next-best-action', desc: 'Actionable recommendations' },
      { label: 'Execution Workspace', path: '/marketing/execution-workspace', desc: 'Campaigns and delivery work' },
    ],
  },
  {
    id: 'nba',
    keywords: ['next best action', 'next best actions', 'nba', 'what should we do', 'recommended action', 'actions'],
    reply: 'Next Best Actions are the prioritized moves for each account, ranked critical / high / medium / watch with why-now and evidence.',
    actions: [
      { label: 'Next Best Action', path: '/marketing/next-best-action', desc: 'Marketing module NBA queue' },
      { label: 'Home — NBA Band', path: '/', desc: 'Organization-level priority actions' },
    ],
  },
  {
    id: 'missed',
    keywords: ['missed opportunity', 'missed opportunities', 'missed', 'too late', 'lost window'],
    reply: 'Missed Opportunities flag commercial windows where evidence suggests earlier action was possible, and whether the window is still open.',
    actions: [{ label: 'Missed Opportunities', path: '/', desc: 'Home — Missed Opportunities section' }],
  },
  {
    id: 'signals',
    keywords: ['signal', 'signals', 'triangulated', 'evidence', 'ai hypothesis', 'heads up'],
    reply: 'Signals are triangulated, evidence-backed intelligence (critical, opportunity, risk, momentum, regulatory, executive change). Home carries the executive heads-up; competition has a dedicated signal feed.',
    actions: [
      { label: 'Home — Heads-Up', path: '/', desc: 'Executive signal cards' },
      { label: 'Competition Signal Feed', path: '/competition/signals', desc: 'Competitive signals timeline' },
    ],
  },
  {
    id: 'opportunities',
    keywords: ['opportunity', 'opportunities', 'opportunity radar', 'radar', 'white space', 'expansion'],
    reply: 'The Opportunity Radar surfaces credible commercial entry points per account — launches, milestones, approvals, digital transformation and leadership changes.',
    actions: [{ label: 'Opportunity Radar', path: '/', desc: 'Home — organization-level radar' }],
  },
  {
    id: 'bigbets',
    keywords: ['big bet', 'big bets', 'strategic bets', 'bet'],
    reply: 'Big Bets are the quarterly strategic objectives with status, progress, evidence, outcome and next step, visualized across quarters.',
    actions: [{ label: 'Big Bets', path: '/', desc: 'Home — quarterly Big Bets view' }],
  },
  {
    id: 'health',
    keywords: ['winning', 'losing', 'org health', 'organization health', 'momentum', 'improving', 'declining', 'accelerating', 'portfolio health', 'health score'],
    reply: 'Portfolio health shows whether the account portfolio is improving, stable, weakening or at risk, with three-quarter trends and interpretation for each account.',
    actions: [{ label: 'Home — Portfolio Health', path: '/', desc: 'Winning vs losing trends' }],
  },
  {
    id: 'executives',
    keywords: ['executive', 'executives', 'exec capital', 'decision makers', 'who to contact', 'cxo', 'leadership', 'contact'],
    reply: 'Exec Capital profiles the decision-makers per account — persona, relationships, conferences and engagement guidance for each executive.',
    actions: [
      { label: 'Exec Capital', path: '/accounts/exec-capital', desc: 'All executive profiles' },
      { label: 'Account Dossiers', path: '/accounts', desc: 'Executives by account' },
    ],
  },
  {
    id: 'bigpicture',
    keywords: ['what is happening', 'what changed', 'summary', 'executive summary', 'overview', 'everything'],
    reply: 'Start with Home for the one-glance executive picture, then use the Account Intelligence dossiers for account-level detail.',
    actions: [
      { label: 'Home', path: '/', desc: 'Executive war room' },
      { label: 'Executive Summary', path: '/executive-summary', desc: 'News and briefings' },
      { label: 'Accounts', path: '/accounts', desc: 'Five client dossiers' },
    ],
  },
  {
    id: 'greet',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    reply: 'Hello. I can point you to any account, module, signal or document in the platform. Try an account name (e.g. AstraZeneca), a module (e.g. Delivery Health) or a topic (e.g. missed opportunities).',
    chips: ['AstraZeneca', 'Delivery Health', 'Missed opportunities', 'Next best actions', 'Competition', 'Big Bets'],
  },
  {
    id: 'help',
    keywords: ['help', 'what can you do', 'how do i', 'guide', 'navigate', 'where is', 'where do i', 'find'],
    reply: 'I can point you to any module, account dossier, document or executive. Try asking for an account name (e.g. AstraZeneca), a module (e.g. Delivery Health) or a topic (e.g. missed opportunities).',
    chips: ['AstraZeneca', 'Delivery Health', 'Missed opportunities', 'Next best actions', 'Competition', 'Big Bets'],
  },
]

export interface ChatResult {
  reply: string
  actions?: ChatAction[]
  docs?: ChatDoc[]
  chips?: string[]
  intentId?: string
}

// Score an intent against the raw query; longer keyword matches win.
// Keywords match as whole words so short keys (hi, az, gsk) never fire inside
// unrelated words (this, amazing, task).
function scoreIntent(intent: ChatIntent, q: string): number {
  let score = 0
  for (const k of intent.keywords) {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`\\b${esc}\\b`).test(q)) score += k.length > 5 ? 3 : 1
  }
  return score
}

export function matchIntent(raw: string): ChatResult | null {
  const q = raw.toLowerCase().trim()
  if (!q) return null

  // 1) Account mention → account dossier (highest priority).
  const acct = ACCOUNTS.find(a => a.keys.some(k => {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${esc}\\b`).test(q)
  }))
  if (acct) {
    return {
      reply: `Opening the ${acct.name} dossier — it covers the latest three quarters, heads-up signals, Big Bets, missed opportunities and Next Best Actions for the account.`,
      intentId: 'account',
      actions: [
        { label: `${acct.name} — Account Intelligence`, path: acct.path, desc: 'Full account dossier' },
        { label: `${acct.name} — Consolidated Report`, path: `/accounts/${acct.id}/consolidated`, desc: 'Consolidated account view' },
        { label: `${acct.name} — Report`, path: `/accounts/${acct.id}/report`, desc: 'Account report' },
      ],
      docs: [
        { label: `${acct.name} — Research Dossier`, path: `/accounts/${acct.id}`, desc: 'Signals, quarters, executives, opportunities, sources' },
        { label: `${acct.name} — Exec Capital`, path: `/accounts/exec-capital`, desc: 'Decision-makers and relationship map' },
      ],
    }
  }

  // 2) Generic intent matching.
  let best: { intent: ChatIntent; score: number } | null = null
  for (const intent of INTENTS) {
    const s = scoreIntent(intent, q)
    if (s > 0 && (!best || s > best.score)) best = { intent, score: s }
  }
  if (!best) return null

  const i = best.intent
  return {
    reply: i.reply,
    actions: i.actions,
    docs: i.docs,
    chips: i.chips,
    intentId: i.id,
  }
}
