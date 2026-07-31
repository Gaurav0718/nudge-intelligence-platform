import { useMemo } from 'react'
import { SectionHeading, EmptyState } from '../../components/shared/ui'
import { computeWhiteSpace, type WhiteSpaceRow } from '../../lib/connectedIntelligence'
import type { EvidenceItem } from '../../lib/orgIntelligence'
import type { OpenEvidence } from './homeTypes'

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 90, h = 26, max = Math.max(...points, 1), min = Math.min(...points, 0)
  const range = max - min || 1
  const coords = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <polyline points={coords} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function rowToEvidence(row: WhiteSpaceRow): EvidenceItem {
  return {
    id: `whitespace:${row.id}`, kind: 'signal', accountId: null, accountName: null, accentColor: null,
    title: row.name, categoryLabel: 'Growth',
    what_happened: row.drivenBy.length > 0
      ? `Whitespace topic in ${row.serviceLine}, currently driven by ${row.drivenBy.join(', ')}. Company status: ${row.isGap ? 'capability gap: not yet an active offering': 'active: Company already competes here'}.`
     : `Whitespace topic in ${row.serviceLine} with no competitor currently active: a first-mover opening. Company status: ${row.isGap ? 'capability gap': 'active'}.`,
    so_what: row.isGap
      ? 'This is rising activity with no current Company offering: building capability here closes a gap before a competitor claims the whitespace.'
     : 'Company already has a foothold here: this is a whitespace topic to lean into further, not build from scratch.',
    factBlock: [{ label: 'Activity trend (4 periods)', value: row.trend.map(t => `${t.period}: ${t.value}`).join('  ·  ') }],
    urgency: row.isGap ? 'Medium': 'Low',
    sources: [], dateISO: null,
  }
}

export default function WhiteSpaceBand({ openEvidence }: { openEvidence: OpenEvidence }) {
  const rows = useMemo(() => computeWhiteSpace(), [])

  return (
    <section id="home-whitespace">
      <SectionHeading eyebrow="13 · Untapped" title="White Space Opportunities"
        sub="Topics with rising activity and no dominant competitor: where Company can move first, or close a capability gap before someone else does." />

      {rows.length === 0 ? <EmptyState title="No whitespace topics tracked" />: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {rows.map(row => (
            <button key={row.id} onClick={() => openEvidence('White Space', row.name, [rowToEvidence(row)])}
              className="card card-clickable" style={{ textAlign: 'left', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{row.serviceLine}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                  background: row.isGap ? 'var(--gold)': 'var(--navy-faint)', color: row.isGap ? '#1B365D': 'var(--navy)',
                }}>
                  {row.isGap ? 'Capability gap': 'Open door'}
                </span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>{row.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4, flex: 1 }}>
                  {row.drivenBy.length > 0 ? `Driven by ${row.drivenBy.slice(0, 2).join(', ')}${row.drivenBy.length > 2 ? ` +${row.drivenBy.length - 2}`: ''}`: 'No competitor active'}
                </span>
                <Sparkline points={row.trend.map(t => t.value)} color={row.isGap ? 'var(--gold-muted)': 'var(--navy)'} />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
