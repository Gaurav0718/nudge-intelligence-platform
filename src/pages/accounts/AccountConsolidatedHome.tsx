import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ExternalLink, TrendingUp, TrendingDown, ListChecks, Scale, Users, Activity, Crosshair, Megaphone } from 'lucide-react'
import { useOrganizationIntelligence, type EvidenceItem, COMPANY_URL } from '../../lib/orgIntelligence'
import { computeConnectedChains, computeWhiteSpace, RELATIONSHIP_META } from '../../lib/connectedIntelligence'
import { computeCXOSnapshot } from '../../lib/cxoSnapshot'
import { DOSSIERS } from '../../data/accounts.seed'
import { buildAccountRoster, rosterExecToEvidence, type RosterExec } from '../../lib/execRoster'
import EvidenceDrawer, { type DrawerView } from '../../components/shared/EvidenceDrawer'
import Avatar from '../../components/shared/Avatar'
import { SectionHeading, Card, EmptyState } from '../../components/shared/ui'
import { Bullets } from '../../components/shared/Bullets'
import { PromotedActionsPanel } from './PromotedActionsPanel'
import { allInitiatives } from '../../lib/initiatives'
import HomeSkeleton from '../home/Skeletons'
import AccountSelect, { type AccountOption } from '../home/AccountSelect'
import { ChainBody } from '../home/ConnectedIntelligenceBand'
import { CXOSnapshotGrid } from '../home/CXOSnapshotBand'
import { QuarterLineChart, PIE_RAMP_NAVY, rampColor } from '../home/charts'
import { InsightsList, RANK } from '../home/QuarterTrendBand'
import { ListRow, sortByUrgency } from '../home/OpportunityBand'
import { NBACardList } from '../home/NBABand'
import { Runway11Grid } from '../home/Runway11Band'
import { MiniDashboard } from '../home/HeadsUpBand'
import type { OpenEvidence } from '../home/homeTypes'

const POLARITY_DOT: Record<string, string> = { Opportunity: 'var(--gold)', Risk: 'var(--navy)', Both: 'var(--gold-muted)' }

// Cross-module shortcuts — from any account's consolidated view, jump straight
// into the module that matters. Keep labels short: the path is the point.
const MODULE_SHORTCUTS = [
  { label: 'Sales & Growth', path: '/executive-summary', Icon: TrendingUp },
  { label: 'Marketing & Service Line', path: '/marketing', Icon: Megaphone },
  { label: 'Delivery Health', path: '/delivery-health', Icon: Activity },
  { label: 'Competition', path: '/competition', Icon: Crosshair },
]

/**
 * Accounts (consolidated view) — the per-account HOME-style page reached from
 * the sidebar's "Accounts" section (/overview). Deliberately separate from the
 * Sales & Growth module's "Account Info" dossier (AccountInfoPage.tsx, a
 * different page at /accounts/:id) — same underlying org-intelligence data
 * layer, but this one is the consolidated single-account narrative with an
 * in-page account switcher, not a route param.
 */
function LeadershipCard({ ex, onClick }: { ex: RosterExec; onClick: () => void }) {
  const relMeta = RELATIONSHIP_META[ex.relationship]
  const blurb = ex.rich?.company_role ?? (ex.research?.linkedOpportunityTitles?.length ? `Linked to ${ex.research.linkedOpportunityTitles[0]}.` : `${ex.title}.`)
  const angle = ex.rich?.indegene_selling_point ?? 'Relationship not yet mapped — an open engagement path worth opening for this account.'
  return (
    <button onClick={onClick} className="card card-clickable"
      style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', padding: 16, position: 'relative', height: '100%', cursor: 'pointer', background: '#fff' }}>
      <span title={`Relationship: ${relMeta.label}`}
        style={{ position: 'absolute', top: 12, right: 12, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: relMeta.bg, color: relMeta.color }}>
        {relMeta.label}
      </span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingRight: 80 }}>
        <Avatar name={ex.name} size={48} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>{ex.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.35 }}>{ex.title}</div>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blurb}</p>
      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 'auto' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 4 }}>Why Company wins here</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{angle}</div>
      </div>
    </button>
  )
}

// Detailed drawer content for a white-space topic — the sparse click was the
// complaint; this expands each into a full opportunity brief.
function whitespaceEvidence(row: ReturnType<typeof computeWhiteSpace>[number], accountId: string | null, accountName: string, accentColor: string | null): EvidenceItem {
  const status = row.isGap ? 'capability gap' : 'open door'
  const drivers = row.drivenBy.length > 0 ? row.drivenBy.join(', ') : 'no dominant competitor'
  const trend = row.trend.slice(-4)
  const rising = trend.length >= 2 && trend[trend.length - 1].value >= trend[0].value
  return {
    id: `whitespace:${row.id}`, kind: 'signal', accountId, accountName, accentColor,
    title: row.name, categoryLabel: 'White Space',
    opportunity_or_risk: 'Opportunity', urgency: row.isGap ? 'Medium' : 'Low', confidence: 'Medium',
    what_happened: `"${row.name}" is an untapped topic in ${row.serviceLine} for ${accountName}. Current activity is driven by ${drivers}, and Company's position here is an ${status}. Activity is ${rising ? 'rising' : 'steady'} (latest index ${row.latestValue}).`,
    ai_hypothesis: `Rising ${row.serviceLine} activity with ${row.isGap ? 'an internal capability gap' : 'no incumbent partner'} points to a first-mover window opening for whoever moves on ${row.name} first.`,
    so_what: row.isGap
      ? `A capability gap means Company cannot yet fully serve this demand — a build-or-partner decision is needed before a rival closes it.`
      : `An open door means Company can enter ${row.serviceLine} at ${accountName} ahead of competitors while the space is uncontested.`,
    why_it_matters: `${accountName} is generating ${row.serviceLine} demand that maps directly onto Company's service lines — an addressable opportunity that is not yet owned by any vendor.`,
    connectedModules: [
      { module: 'Market Intel', signal: `Rising ${row.serviceLine} activity at ${accountName} (index ${row.latestValue}, ${rising ? 'trending up' : 'steady'}).` },
      { module: 'Sales & Growth', signal: `No Company engagement mapped to "${row.name}" — ${row.isGap ? 'a capability gap' : 'an open door'} in ${row.serviceLine}.` },
      { module: 'Competition', signal: row.drivenBy.length > 0 ? `Activity currently driven by ${drivers}; no vendor has claimed this topic.` : 'No competitor active on this topic yet — uncontested.' },
    ],
    if_no_action: row.isGap
      ? `The build-or-partner decision slips and a rival closes the "${row.name}" gap first, converting an open topic into a competitor's beachhead in ${row.serviceLine}.`
      : `A competitor opens the ${row.serviceLine} conversation at ${accountName} first and anchors "${row.name}" to their positioning while the space is still uncontested.`,
    nbas: [{
      action: row.isGap
        ? `Take a build-vs-partner point of view on "${row.name}" to ${accountName}, leading with a Company reference in ${row.serviceLine}.`
        : `Open a ${row.serviceLine} conversation at ${accountName} positioning "${row.name}", anchored on the client's own rising activity.`,
      actor: 'Account Executive + relevant Service-Line Lead',
      target: `${accountName} ${row.serviceLine} decision-maker`,
      whyNow: `Activity is ${rising ? 'rising' : 'steady'} and ${row.drivenBy.length > 0 ? 'partially contested' : 'still uncontested'} — the first-mover window is open now.`,
      outcome: `A qualified ${row.serviceLine} opportunity created before a competitor claims "${row.name}".`,
    }],
    expected_outcome: `"${row.name}" converted from untracked whitespace into a named, owned pursuit in ${row.serviceLine} at ${accountName}.`,
    evidence_gaps: 'Opportunity value not established from available evidence — activity index is directional, not a booking forecast.',
    factBlock: [
      { label: 'Service line', value: row.serviceLine },
      { label: 'Company position', value: row.isGap ? 'Capability gap' : 'Open door' },
      { label: 'Latest activity index', value: String(row.latestValue) },
      { label: 'Driven by', value: drivers },
      ...trend.map(t => ({ label: t.period, value: String(t.value) })),
    ],
    sources: [], dateISO: null,
  }
}

// Shared card used by both "Top priority" and "Recent signals" so the two rows
// are visually identical (per the brief: recent signals laid out like top priority).
function SignalMiniCard({ ev, onClick }: { ev: EvidenceItem; onClick: () => void }) {
  const Icon = ev.opportunity_or_risk === 'Risk' ? TrendingDown : TrendingUp
  const why = ev.so_what ?? ev.why_it_matters ?? ev.what_happened
  return (
    <button onClick={onClick} className="card hero-card-hover"
      style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', cursor: 'pointer', background: '#ffffff', borderRadius: 14, padding: 18, minHeight: 150 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--navy-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color="var(--navy)" />
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.4, color: 'var(--text-1)' }}>{ev.title}</div>
      </div>
      {why && (
        <div style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 8 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 2 }}>Why it matters</div>
          <Bullets items={why} compact clamp={2} style={{ marginTop: 4 }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 4 }}>
        {ev.categoryLabel && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--navy-faint)', color: 'var(--navy)' }}>{ev.categoryLabel}</span>}
        {ev.dateISO && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--bg-raised)', color: 'var(--text-3)' }}>{ev.dateISO}</span>}
        {ev.confidence && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--gold-light)', color: 'var(--gold-muted)' }}>{ev.confidence} confidence</span>}
      </div>
    </button>
  )
}

export default function AccountConsolidatedHome() {
  const nav = useNavigate()
  const { data, loading, error } = useOrganizationIntelligence()
  const [drawerStack, setDrawerStack] = useState<DrawerView[]>([])

  const openEvidence: OpenEvidence = useCallback((eyebrow, title, items, emptyLabel) => {
    setDrawerStack(s => [...s, { eyebrow, title, items: items as EvidenceItem[], emptyLabel }])
  }, [])
  const closeDrawer = useCallback(() => setDrawerStack([]), [])
  const backDrawer = useCallback(() => setDrawerStack(s => s.slice(0, -1)), [])
  const scrollTo = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const accountOptions: AccountOption[] = useMemo(
    () => data?.quarters.map(q => ({ id: q.accountId, label: q.accountName, color: q.accentColor })) ?? [],
    [data],
  )
  const [accountId, setAccountId] = useState<string | null>(null)
  const activeId = accountId ?? accountOptions[0]?.id ?? null
  const accountMeta = useMemo(() => data?.quarters.find(q => q.accountId === activeId) ?? null, [data, activeId])

  const chain = useMemo(() => (data && activeId ? computeConnectedChains(data).find(c => c.accountId === activeId) ?? null : null), [data, activeId])
  const snapshot = useMemo(() => (data && activeId ? computeCXOSnapshot(data, activeId) : null), [data, activeId])

  const topSignals = useMemo(() => {
    if (!data || !activeId) return []
    return Object.values(data.evidenceById)
      .filter(e => e.accountId === activeId && e.urgency === 'High')
      .sort((a, b) => (RANK[b.confidence ?? 'Low'] ?? 0) - (RANK[a.confidence ?? 'Low'] ?? 0))
      .slice(0, 6)
  }, [data, activeId])

  const financialInsights = useMemo(() => {
    if (!data || !activeId) return []
    return Object.values(data.evidenceById)
      .filter(e => e.accountId === activeId && e.categoryLabel === 'Financial' && e.ai_hypothesis)
      .sort((a, b) => (RANK[b.urgency ?? 'Low'] * 3 + RANK[b.confidence ?? 'Low']) - (RANK[a.urgency ?? 'Low'] * 3 + RANK[a.confidence ?? 'Low']))
      .slice(0, 5)
  }, [data, activeId])

  const openList = useMemo(() => (data && activeId ? data.opportunityLedger.open.filter(o => o.accountId === activeId).map(o => data.evidenceById[o.evidenceId]).filter(Boolean).sort(sortByUrgency) : []), [data, activeId])
  // Big Bets — dossier bets (2–3) are too few; top up to 6–9 from emerging
  // strategic priorities and live opportunities so the grid reads as a 3×3.
  const bigBetsFull = useMemo(() => {
    if (!snapshot) return []
    type Bet = { title: string; body: string; progressLabel: string; inMotion: boolean }
    const bets: Bet[] = [...snapshot.bigBets]
    const seen = new Set(bets.map(b => b.title.toLowerCase()))
    const add = (b: Bet) => { const k = b.title.toLowerCase(); if (!seen.has(k)) { seen.add(k); bets.push(b) } }
    const dossier = DOSSIERS.find(d => d.account_id === activeId)
    for (const p of dossier?.emerging_priorities ?? []) {
      if (bets.length >= 9) break
      const clean = p.replace(/\.$/, '')
      add({ title: clean.length > 46 ? clean.slice(0, 44).trim() + '…' : clean, body: p, inMotion: false, progressLabel: 'Strategic priority flagged — no tracked engagement yet.' })
    }
    for (const o of openList) {
      if (bets.length >= 9) break
      const t = o.title
      add({ title: t.length > 46 ? t.slice(0, 44) + '…' : t, body: o.so_what ?? o.what_happened ?? o.why_it_matters ?? '', inMotion: true, progressLabel: 'Live opportunity in the ledger — early engagement.' })
    }
    return bets
  }, [snapshot, activeId, openList])
  const snapshotView = useMemo(() => (snapshot ? { ...snapshot, bigBets: bigBetsFull } : null), [snapshot, bigBetsFull])
  const missedList = useMemo(() => (data && activeId ? data.opportunityLedger.missed.filter(o => o.accountId === activeId).map(o => data.evidenceById[o.evidenceId]).filter(Boolean).sort(sortByUrgency) : []), [data, activeId])
  const nbaItems = useMemo(() => (data && activeId ? data.nba.filter(n => n.accountId === activeId) : []), [data, activeId])
  const polarityItems = useMemo(() => (data && activeId ? Object.values(data.evidenceById).filter(e => e.accountId === activeId && e.opportunity_or_risk) : []), [data, activeId])
  const polarityBucket = useMemo(() => ({
    opp: polarityItems.filter(e => e.opportunity_or_risk === 'Opportunity'),
    risk: polarityItems.filter(e => e.opportunity_or_risk === 'Risk'),
    both: polarityItems.filter(e => e.opportunity_or_risk === 'Both'),
  }), [polarityItems])
  const oppRiskSegments = useMemo(() => [
    { key: 'opp', label: 'Opportunity', value: polarityBucket.opp.length, color: PIE_RAMP_NAVY[0] },
    { key: 'risk', label: 'Risk', value: polarityBucket.risk.length, color: PIE_RAMP_NAVY[1] },
    { key: 'both', label: 'Both', value: polarityBucket.both.length, color: PIE_RAMP_NAVY[3] },
  ].filter(s => s.value > 0), [polarityBucket])
  // Account-level view: break NBAs down by signal category (Financial, Growth,
  // Regulatory, Competitive …), not urgency — at one account almost everything
  // is "High urgency", which collapses the pie into a single meaningless slice.
  const nbaByCategory = useMemo(() => {
    if (!data) return []
    const counts = new Map<string, number>()
    for (const n of nbaItems) {
      const cat = data.evidenceById[n.evidenceId]?.categoryLabel ?? 'Other'
      counts.set(cat, (counts.get(cat) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cat, value], i) => ({ key: cat, label: cat, value, color: rampColor(PIE_RAMP_NAVY, i) }))
  }, [data, nbaItems])
  const openNbaCategory = useCallback((cat: string) => {
    if (!data || !accountMeta) return
    const ids = nbaItems.filter(n => (data.evidenceById[n.evidenceId]?.categoryLabel ?? 'Other') === cat)
      .map(n => data.evidenceById[n.evidenceId]).filter(Boolean) as EvidenceItem[]
    openEvidence(accountMeta.accountName, `${cat} actions`, ids)
  }, [data, accountMeta, nbaItems, openEvidence])
  // Unified executive roster (rich + org + research), deduped and ranked — one
  // roster feeds both Key Executives (top 3) and Leadership Intelligence (7–8).
  const execRoster = useMemo(
    () => (data && activeId ? buildAccountRoster(data, activeId) : []),
    [data, activeId],
  )
  const timelineItems = useMemo(() => (data && activeId ? data.timeline.filter(t => t.accountId === activeId).slice(0, 20) : []), [data, activeId])
  // Signals-over-time, bucketed by month, for the Signal Timeline dashboard.
  const signalTimeline = useMemo(() => {
    if (!data || !activeId) return []
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const buckets = new Map<string, string[]>()
    for (const n of data.timeline.filter(t => t.accountId === activeId && t.dateISO)) {
      const key = n.dateISO!.slice(0, 7) // YYYY-MM
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(n.evidenceId)
    }
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, ids]) => {
      const [y, m] = key.split('-')
      return { key, label: `${MONTHS[Number(m) - 1]} '${y.slice(2)}`, count: ids.length, evidenceIds: ids }
    })
  }, [data, activeId])
  const openSignalPeriod = useCallback((label: string, evidenceIds: string[]) => {
    if (!data || !accountMeta) return
    const items = evidenceIds.map(id => data.evidenceById[id]).filter(Boolean) as EvidenceItem[]
    openEvidence(accountMeta.accountName, `Signals · ${label}`, items)
  }, [data, accountMeta, openEvidence])
  // Top 3 executives — same roster (names, photos, tags) as Leadership Intelligence.
  const topExecs = useMemo(() => execRoster.slice(0, 3), [execRoster])
  const openExec = useCallback((ex: RosterExec) => {
    if (!data || !accountMeta) return
    openEvidence(accountMeta.accountName, ex.name, [rosterExecToEvidence(ex, accountMeta.accountName, data)])
  }, [data, accountMeta, openEvidence])
  // Last 6 tracked signals, resolved to evidence, rendered as Top-Priority-style cards.
  const recentSignals = useMemo(
    () => (data ? timelineItems.slice(0, 6).map(n => data.evidenceById[n.evidenceId]).filter(Boolean) as EvidenceItem[] : []),
    [data, timelineItems],
  )
  const [nbaTab, setNbaTab] = useState<'actions' | 'promoted'>('actions')
  const [promotedRefresh, setPromotedRefresh] = useState(0)
  const bumpPromoted = useCallback(() => setPromotedRefresh(x => x + 1), [])
  const promotedCount = useMemo(
    () => allInitiatives().filter(i => i.module === 'Organization' && i.source_type === 'HomeNextBestAction' && i.account_id === activeId).length,
    [activeId, promotedRefresh],
  )

  const whitespace = useMemo(() => {
    const all = computeWhiteSpace()
    if (!snapshot) return all
    const lines = new Set(snapshot.serviceLineMix.map(r => r.serviceLine))
    const relevant = all.filter(w => lines.has(w.serviceLine as any))
    return relevant.length > 0 ? relevant : all
  }, [snapshot])

  const companyUrl = activeId ? COMPANY_URL[activeId] : null

  return (
    <div className="home-light-root" style={{ margin: '-24px -28px -48px', padding: '24px 28px 48px', minHeight: 'calc(100vh - var(--topbar-h))' }}>
      <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px', minWidth: 260 }}>
          <p className="eyebrow" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>
            ACCOUNTS · CONSOLIDATED VIEW
          </p>
          <h1 className="home-band-title" style={{ fontSize: 28, color: 'var(--text-1)' }}>{accountMeta?.accountName ?? 'Account'}</h1>
          <p style={{ fontSize: 14.5, color: 'var(--text-2)', marginTop: 6, maxWidth: 720 }}>
            One account, every module fused into a single narrative — read top to bottom for the situation, drill into any card for the evidence behind it.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, alignSelf: 'stretch' }}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', whiteSpace: 'nowrap' }}>
            {MODULE_SHORTCUTS.map(({ label, path, Icon }) => (
              <button key={path} onClick={() => nav(path)} title={`Open ${label} module`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                  border: '1px solid var(--border)', background: 'var(--bg-raised)', fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)' }}>
                <Icon size={13} color="var(--navy)" />{label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {accountOptions.length > 0 && (
            <AccountSelect options={accountOptions} value={activeId} onChange={setAccountId} allowAll={false} />
          )}
          <div style={{ flex: 1 }} />
        </div>
      </div>

      {loading && <HomeSkeleton />}

      {!loading && (error || !data) && (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState icon={<AlertTriangle size={32} color="var(--gold)" />} title="Account intelligence unavailable"
            sub={error ?? 'Try reloading the page.'} />
        </div>
      )}

      {!loading && data && !accountMeta && (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState title="No accounts under intelligence coverage yet" />
        </div>
      )}

      {!loading && data && accountMeta && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Executive Insight — this account only */}
          <section style={{
            background: 'linear-gradient(155deg, #1c3155 0%, #24406e 100%)', borderRadius: 'var(--radius-xl)',
            padding: '30px 30px 26px', color: '#fff', position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.22)',
          }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
                <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', color: '#fff', margin: 0 }}>
                  Executive Intelligence
                </h2>
                {companyUrl && (
                  <a href={companyUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#fff', opacity: 0.85 }}>
                    Visit {accountMeta.accountName} <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', maxWidth: 640 }}>
                The situation, the numbers, and the people to engage — at a glance.
              </p>

              <div className="home-heads-up-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, alignItems: 'stretch' }}>
                {/* Key executives — same roster (and photos) as Leadership Intelligence */}
                <div className="card" style={{ minWidth: 0, background: '#ffffff', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>
                      <Users size={16} color="var(--navy)" />Key Executives
                    </span>
                    <button onClick={() => scrollTo('home-executives')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: 'var(--navy)' }}>View all</button>
                  </div>
                  {topExecs.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No executives on file.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {topExecs.map(ex => {
                        const relMeta = RELATIONSHIP_META[ex.relationship]
                        return (
                          <button key={ex.key} onClick={() => openExec(ex)} className="home-hover"
                            style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 6px', borderRadius: 'var(--radius-sm)' }}>
                            <Avatar name={ex.name} size={40} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                              <div style={{ fontSize: 10.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.title}</div>
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: relMeta.bg, color: relMeta.color }}>{relMeta.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <MiniDashboard icon={ListChecks} title="Next Best Actions" segments={nbaByCategory}
                  centerLabel={String(nbaItems.length)} centerSub="actions"
                  onSegmentClick={cat => openNbaCategory(cat)} onViewAll={() => scrollTo('home-nba')} />
                <MiniDashboard icon={Scale} title="Opportunity vs. Risk" segments={oppRiskSegments}
                  centerLabel={String(polarityItems.length)} centerSub="signals"
                  onSegmentClick={key => { const ids = (polarityBucket as any)[key].slice(0, 8) as EvidenceItem[]; openEvidence(accountMeta.accountName, key === 'risk' ? 'Open Risks' : key === 'both' ? 'Mixed Signals' : 'Open Opportunities', ids) }}
                  onViewAll={() => scrollTo('home-opportunity')} />
              </div>

              {topSignals.length === 0 ? (
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 22 }}>No high-priority signals tracked for this account.</div>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', marginTop: 22, marginBottom: 10 }}>
                    Top priority
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="home-heads-up-grid">
                    {topSignals.map(ev => (
                      <SignalMiniCard key={ev.id} ev={ev} onClick={() => openEvidence(accountMeta.accountName, ev.title, [ev])} />
                    ))}
                  </div>
                </>
              )}

              {recentSignals.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff' }}>
                      Recent signals
                    </div>
                    <button onClick={() => scrollTo('consolidated-timeline')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                      Full timeline →
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="home-heads-up-grid">
                    {recentSignals.map(ev => (
                      <SignalMiniCard key={`recent:${ev.id}`} ev={ev} onClick={() => openEvidence(accountMeta.accountName, ev.title, [ev])} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Connected Intelligence */}
          <section id="consolidated-connected">
            <SectionHeading eyebrow="Cause and effect" title="Connected Intelligence"
              sub="Delivery Health, Competition, and Marketing whitespace fused into one narrative — with an explicit Why It Matters and Next Best Action." />
            {!chain ? <EmptyState title="No cross-module chain available for this account" /> : (
              <Card><ChainBody chain={chain} openEvidence={openEvidence} /></Card>
            )}
          </section>

          {/* CXO Snapshot */}
          {snapshot && (
            <section id="consolidated-cxo-snapshot">
              <SectionHeading eyebrow="What a CXO sees first" title="Financial & Growth Snapshot"
                sub="Every number is a comparison, not a raw figure — click any tile for the evidence behind it." />
              <CXOSnapshotGrid snapshot={snapshotView ?? snapshot} accountName={accountMeta.accountName} data={data} openEvidence={openEvidence} onScrollTo={scrollTo} interactive />
            </section>
          )}

          {/* Quarterly trend */}
          <section id="home-quarters">
            <SectionHeading eyebrow="Momentum" title="Quarterly Trend" sub="Revenue by quarter, with the insight behind it." />
            <Card style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'stretch', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 460px', minWidth: 340, maxWidth: 560 }}>
                  <QuarterLineChart facet={accountMeta} evidenceById={data.evidenceById} openEvidence={openEvidence} bare />
                </div>
                <div style={{ flex: '1 1 260px', minWidth: 240, borderLeft: '1px solid var(--border)', paddingLeft: 22, display: 'flex', flexDirection: 'column' }}>
                  <InsightsList items={financialInsights} openEvidence={openEvidence} />
                </div>
              </div>
            </Card>
          </section>

          {/* Opportunity vs Risk */}
          <section id="home-opportunity">
            <SectionHeading eyebrow="Balance" title="Opportunity vs. Risk" sub="Open and closing commercial windows for this account." />
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <TrendingUp size={14} color="var(--navy)" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>Open Opportunities</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({openList.length})</span>
                  </div>
                  {openList.length === 0 ? <EmptyState title="No open opportunities for this account" /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 260, overflowY: 'auto' }}>
                      {openList.map(item => <ListRow key={item.id} item={item} isMissed={false} openEvidence={openEvidence} />)}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <TrendingDown size={14} color="var(--gold-muted)" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>Closing / Missed</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({missedList.length})</span>
                  </div>
                  {missedList.length === 0 ? <EmptyState title="Nothing closing for this account" /> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 260, overflowY: 'auto' }}>
                      {missedList.map(item => <ListRow key={item.id} item={item} isMissed openEvidence={openEvidence} />)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </section>

          {/* White Space */}
          <section id="consolidated-whitespace">
            <SectionHeading eyebrow="Untapped" title="White Space Opportunities"
              sub="Topics relevant to this account's service lines with rising activity and no dominant competitor." />
            {whitespace.length === 0 ? <EmptyState title="No whitespace topics tracked" /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }} className="home-heads-up-grid">
                {whitespace.slice(0, 4).map(row => (
                  <button key={row.id}
                    onClick={() => openEvidence('White Space', row.name, [whitespaceEvidence(row, activeId, accountMeta.accountName, accountMeta.accentColor)])}
                    className="card card-clickable" style={{ textAlign: 'left', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, background: '#ffffff', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: row.isGap ? 'var(--gold)' : 'var(--navy-faint)', color: row.isGap ? '#1B365D' : 'var(--navy)' }}>
                        {row.isGap ? 'Capability gap' : 'Open door'}
                      </span>
                      <span style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600 }}>{row.serviceLine}</span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>{row.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                      {row.drivenBy.length > 0 ? `Driven by ${row.drivenBy.join(', ')}. ` : 'No competitor active yet. '}
                      Activity index {row.latestValue} and climbing.
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--navy)', marginTop: 'auto', paddingTop: 4 }}>View full opportunity brief →</div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Next Best Action */}
          <section id="home-nba">
            <SectionHeading eyebrow="Act" title="Next Best Actions" sub="Ranked by urgency and confidence for this account. Promote an action to track it in the Promoted tab." />

            <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 12, background: 'var(--bg-raised)', border: '1px solid var(--border)', marginBottom: 18 }}>
              {([['actions', `Actions${nbaItems.length ? ` (${nbaItems.length})` : ''}`], ['promoted', `Promoted${promotedCount ? ` (${promotedCount})` : ''}`]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setNbaTab(key)}
                  style={{ fontSize: 12.5, fontWeight: 700, padding: '8px 16px', borderRadius: 9, cursor: 'pointer', border: 'none', background: nbaTab === key ? 'var(--navy)' : 'transparent', color: nbaTab === key ? '#fff' : 'var(--text-2)' }}>
                  {label}
                </button>
              ))}
            </div>

            {nbaTab === 'promoted' ? (
              <PromotedActionsPanel accountId={activeId} data={data} openEvidence={openEvidence} refreshKey={promotedRefresh} onChange={bumpPromoted} />
            ) : (
            <>
            {signalTimeline.length > 0 && (() => {
              const maxCount = Math.max(...signalTimeline.map(b => b.count), 1)
              const total = signalTimeline.reduce((n, b) => n + b.count, 0)
              return (
                <Card style={{ padding: '20px 26px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>Signal Timeline</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Signals logged over time — click a bar to open that month's signals</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{total} signals · {signalTimeline.length} months</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150, paddingTop: 8, overflowX: 'auto' }}>
                    {signalTimeline.map(b => {
                      const h = Math.max((b.count / maxCount) * 116, 6)
                      return (
                        <button key={b.key} className="home-hover"
                          onClick={() => openSignalPeriod(b.label, b.evidenceIds)}
                          title={`${b.label} · ${b.count} signal${b.count === 1 ? '' : 's'}`}
                          style={{ flex: '1 0 34px', minWidth: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>{b.count}</span>
                          <div style={{ width: '100%', maxWidth: 30, height: h, background: 'var(--navy)', borderRadius: '4px 4px 0 0' }} />
                          <span style={{ fontSize: 10, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{b.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              )
            })()}
            <NBACardList items={nbaItems} data={data} openEvidence={openEvidence} onPromote={bumpPromoted} />
            </>
            )}
          </section>

          {/* Leadership Intelligence — Runway 11 relationship + opportunity mapping folded in */}
          <section id="home-executives">
            <SectionHeading eyebrow="Engage" title="Leadership Intelligence"
              sub="Each contact carries a relationship tag — Champion, Warm, Cold or White Space. Click a card for traits, do's and don'ts, and the Company angle. Opportunity ownership and engagement preferences sit below." />
            {execRoster.length === 0 ? <EmptyState title="No executives on file for this account" /> : (
              <div className="home-exec-grid">
                {execRoster.slice(0, 8).map(ex => (
                  <LeadershipCard key={ex.key} ex={ex} onClick={() => openExec(ex)} />
                ))}
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <Runway11Grid accountId={activeId} data={data} openEvidence={openEvidence} hideOrgChart />
            </div>
          </section>

          {/* Timeline */}
          <section id="consolidated-timeline">
            <SectionHeading eyebrow="Prove it" title="Signal Timeline" sub="Every tracked signal for this account, most recent first." />
            {timelineItems.length === 0 ? <EmptyState title="No signals on file" /> : (
              <div className="card" style={{ padding: '6px 20px' }}>
                {timelineItems.map((node, i) => (
                  <button key={node.evidenceId}
                    onClick={() => { const ev = data.evidenceById[node.evidenceId]; if (ev) openEvidence(accountMeta.accountName, ev.title, [ev]) }}
                    className="home-hover"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <span style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, paddingTop: 4, flexShrink: 0, width: 74 }}>{node.dateISO ?? '—'}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: POLARITY_DOT[node.polarity], marginTop: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{node.categoryLabel}</span>
                      <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500, lineHeight: 1.4 }}>{node.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <EvidenceDrawer stack={drawerStack} onClose={closeDrawer} onBack={backDrawer} />
    </div>
  )
}
