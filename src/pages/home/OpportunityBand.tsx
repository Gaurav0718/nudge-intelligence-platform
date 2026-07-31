import { useMemo, useState } from 'react'
import { SectionHeading, Card, EmptyState } from '../../components/shared/ui'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { OrganizationIntelligence, EvidenceItem } from '../../lib/orgIntelligence'
import { PieChart, PIE_RAMP_NAVY } from './charts'
import AccountSelect, { type AccountOption } from './AccountSelect'
import type { OpenEvidence } from './homeTypes'

function UrgencyPill({ u }: { u: 'High' | 'Medium' | 'Low' }) {
  const style = u === 'High'
    ? { background: 'var(--gold)', color: '#1B365D' }
   : u === 'Medium'
      ? { background: 'var(--gold-light)', color: 'var(--gold-muted)' }
     : { background: 'var(--navy-faint)', color: 'var(--navy)' }
  return <span style={{ ...style, display: 'inline-flex', padding: '3px 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>{u}</span>
}

export function ListRow({ item, isMissed, openEvidence }: { item: EvidenceItem; isMissed: boolean; openEvidence: OpenEvidence }) {
  return (
    <button
      onClick={() => openEvidence(item.accountName ?? '', item.title, [item])}
      className="home-hover"
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer',
        background: isMissed ? 'var(--gold-light)': 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${isMissed ? 'var(--gold)': 'var(--navy)'}`,
        borderRadius: 'var(--radius-sm)', padding: '10px 12px',
      }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-1)', flex: 1, lineHeight: 1.4 }}>{item.title}</span>
      {item.urgency && <UrgencyPill u={item.urgency} />}
    </button>
  )
}

export default function OpportunityBand({ data, openEvidence }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
}) {
  const accountOptions: AccountOption[] = useMemo(
    () => data.quarters.map(q => ({ id: q.accountId, label: q.accountName, color: q.accentColor })),
    [data.quarters],
  )
  const [pieAccount, setPieAccount] = useState<string | null>(null)
  const [listAccount, setListAccount] = useState<string | null>(accountOptions[0]?.id ?? null)

  const polarityItems = useMemo(() => Object.values(data.evidenceById).filter(e => e.opportunity_or_risk), [data.evidenceById])
  const scoped = pieAccount ? polarityItems.filter(e => e.accountId === pieAccount): polarityItems
  const bucket = {
    opp: scoped.filter(e => e.opportunity_or_risk === 'Opportunity'),
    risk: scoped.filter(e => e.opportunity_or_risk === 'Risk'),
    both: scoped.filter(e => e.opportunity_or_risk === 'Both'),
  }
  // Light card surface → navy-only ramp (never mixed with gold here).
  const segments = [
    { key: 'opp', label: 'Opportunity', value: bucket.opp.length, color: PIE_RAMP_NAVY[0] },
    { key: 'risk', label: 'Risk', value: bucket.risk.length, color: PIE_RAMP_NAVY[1] },
    { key: 'both', label: 'Both', value: bucket.both.length, color: PIE_RAMP_NAVY[3] },
  ].filter(s => s.value > 0)

  const onSegmentClick = (key: string) => {
    const items = (bucket as any)[key].slice(0, 12) as EvidenceItem[]
    const scopeLabel = pieAccount ? accountOptions.find(a => a.id === pieAccount)?.label: 'All accounts'
    openEvidence(scopeLabel ?? 'Organization', `${segments.find(s => s.key === key)?.label} signals`, items)
  }

  const listItems = listAccount ? Object.values(data.evidenceById).filter(e => e.accountId === listAccount): []
  const openList = listItems.filter(e => e.kind === 'opportunity').sort(sortByUrgency)
  const missedList = listItems.filter(e => e.kind === 'missed').sort(sortByUrgency)

  return (
    <section id="home-opportunity">
      <SectionHeading eyebrow="Balance" title="Opportunity vs. Risk"
        sub="The polarity of every tracked signal, then the open and closing commercial windows behind it." />

      <Card style={{ padding: '22px 26px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Signal Balance</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Click a segment or row for the signals behind it</div>
          </div>
          <AccountSelect options={accountOptions} value={pieAccount} onChange={setPieAccount} allowAll />
        </div>
        {segments.length === 0 ? <EmptyState title="No signals for this account" />: (
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 auto' }}>
              <PieChart segments={segments} onSegmentClick={onSegmentClick} showLegend={false} solid />
            </div>
            <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 240 }}>
              {segments.map(s => {
                const pct = Math.round((s.value / scoped.length) * 100)
                return (
                  <button key={s.key} onClick={() => onSegmentClick(s.key)} className="home-hover"
                    style={{ display: 'flex', flexDirection: 'column', gap: 5, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', padding: '8px 10px', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-2)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, boxShadow: '0 0 0 1px rgba(255,255,255,0.55)' }} />{s.label}
                      </span>
                      <span style={{ color: 'var(--text-3)' }}>{s.value} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-raised)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: 999 }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>Commercial Windows</div>
          <AccountSelect options={accountOptions} value={listAccount} onChange={setListAccount} allowAll={false} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <TrendingUp size={14} color="var(--navy)" />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>Open Opportunities</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>({openList.length})</span>
            </div>
            {openList.length === 0 ? <EmptyState title="No open opportunities for this account" />: (
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
            {missedList.length === 0 ? <EmptyState title="Nothing closing for this account" />: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 260, overflowY: 'auto' }}>
                {missedList.map(item => <ListRow key={item.id} item={item} isMissed openEvidence={openEvidence} />)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </section>
  )
}

const URGENCY_RANK: Record<string, number> = { High: 3, Medium: 2, Low: 1 }
export function sortByUrgency(a: EvidenceItem, b: EvidenceItem) {
  return (URGENCY_RANK[b.urgency ?? 'Low'] ?? 0) - (URGENCY_RANK[a.urgency ?? 'Low'] ?? 0)
}
