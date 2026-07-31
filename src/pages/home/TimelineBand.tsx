import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { SectionHeading, EmptyState } from '../../components/shared/ui'
import AccountSelect, { type AccountOption } from './AccountSelect'
import type { OrganizationIntelligence } from '../../lib/orgIntelligence'
import { withinWindow, type TimeWindowKey } from '../../lib/timeWindow'
import type { OpenEvidence } from './homeTypes'

const PAGE = 12
const POLARITY_DOT: Record<string, string> = { Opportunity: 'var(--gold)', Risk: 'var(--navy)', Both: 'var(--gold-muted)' }

export default function TimelineBand({ data, openEvidence, windowKey, anchorDate }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  windowKey: TimeWindowKey
  anchorDate: string | null
}) {
  const [accountFilter, setAccountFilter] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE)

  const accountOptions: AccountOption[] = useMemo(
    () => Array.from(new Map(data.timeline.map(t => [t.accountId, { id: t.accountId, label: t.accountName, color: t.accentColor }])).values()),
    [data.timeline],
  )
  const categoryOptions: AccountOption[] = useMemo(
    () => Array.from(new Set(data.timeline.map(t => t.categoryLabel))).sort().map(c => ({ id: c, label: c })),
    [data.timeline],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.timeline.filter(t =>
      (!accountFilter || t.accountId === accountFilter) &&
      (!categoryFilter || t.categoryLabel === categoryFilter) &&
      (!q || t.title.toLowerCase().includes(q)) &&
      withinWindow(t.dateISO, anchorDate, windowKey),
    )
  }, [data.timeline, accountFilter, categoryFilter, query, anchorDate, windowKey])
  const shown = filtered.slice(0, visible)

  const resetPage = () => setVisible(PAGE)

  return (
    <section id="home-timeline">
      <SectionHeading eyebrow="Prove it" title="Organization Signal Timeline"
        sub="Every tracked signal, most recent first. Search, filter by account or category, hover for the evidence line, click for the full record." />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input value={query} onChange={e => { setQuery(e.target.value); resetPage() }} placeholder="Search signals by title…"
            style={{
              width: '100%', padding: '9px 14px 9px 38px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-surface)', color: 'var(--text-1)', fontSize: 13, outline: 'none',
            }} />
        </div>
        <AccountSelect options={accountOptions} value={accountFilter} onChange={v => { setAccountFilter(v); resetPage() }} allowAll allLabel="All accounts" />
        <AccountSelect options={categoryOptions} value={categoryFilter} onChange={v => { setCategoryFilter(v); resetPage() }} allowAll allLabel="All categories" />
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 8 }}>{filtered.length} signal{filtered.length === 1 ? '': 's'}</div>

      {filtered.length === 0 ? <EmptyState title="No signals for this filter" sub="Try a different search term, account, or category." />: (
        <div className="card" style={{ padding: '6px 20px' }}>
          {shown.map((node, i) => (
            <button key={node.evidenceId}
              onClick={() => { const ev = data.evidenceById[node.evidenceId]; if (ev) openEvidence(node.accountName, ev.title, [ev]) }}
              title={data.evidenceById[node.evidenceId]?.evidence ?? ''}
              className="home-hover"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer',
                background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', padding: '12px 14px',
                borderTop: i === 0 ? 'none': '1px solid var(--border)',
              }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4, flexShrink: 0, width: 74 }}>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600 }}>{node.dateISO ?? ':'}</span>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: POLARITY_DOT[node.polarity], marginTop: 6, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{node.accountName}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>· {node.categoryLabel}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500, lineHeight: 1.4 }}>{node.title}</div>
              </div>
            </button>
          ))}
          {visible < filtered.length && (
            <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
              <button onClick={() => setVisible(v => v + PAGE)} className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Load earlier <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
