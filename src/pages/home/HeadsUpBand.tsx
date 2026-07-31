import { useMemo } from 'react'
import { TrendingUp, TrendingDown, ArrowLeftRight, AlertTriangle, ArrowRight, ListChecks, Scale } from 'lucide-react'
import type { OrganizationIntelligence, EvidenceItem } from '../../lib/orgIntelligence'
import { PieChart, PIE_RAMP_NAVY, rampColor } from './charts'
import { withinWindow, type TimeWindowKey } from '../../lib/timeWindow'
import type { OpenEvidence } from './homeTypes'
import { Bullets } from '../../components/shared/Bullets'

// Same white card + navy hover-glow as the top-priority cards below: one visual
// language for every clickable card in Home. Light card surface → navy-only ramp.
export function MiniDashboard({ icon: Icon, title, segments, centerLabel, centerSub, onSegmentClick, onViewAll }: {
  icon: typeof ListChecks
  title: string
  segments: { key: string; label: string; value: number; color: string }[]
  centerLabel: string
  centerSub: string
  onSegmentClick: (key: string) => void
  onViewAll: () => void
}) {
  return (
    <button onClick={onViewAll} className="card card-clickable"
      style={{ flex: '1 1 300px', minWidth: 0, background: '#ffffff', borderRadius: 14, padding: '16px 18px', textAlign: 'left', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>
          <Icon size={15} color="var(--navy)" />{title}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: 'var(--navy)' }}>
          View detail <ArrowRight size={11} />
        </span>
      </div>
      {segments.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '10px 0' }}>Nothing tracked yet.</div>
      ): (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <PieChart segments={segments} size={104} onSegmentClick={onSegmentClick} showLegend={false} solid />
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', marginTop: 4 }}>{centerLabel}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{centerSub}</div>
          </div>
          <div style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 }}>
            {segments.slice(0, 5).map(s => (
              <span key={s.key} role="button" tabIndex={0}
                onClick={e => { e.stopPropagation(); onSegmentClick(s.key) }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: 'var(--text-2)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: s.color, flexShrink: 0, boxShadow: '0 0 0 1px rgba(255,255,255,0.55)' }} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                <span style={{ color: 'var(--text-3)', flexShrink: 0, fontWeight: 700 }}>{s.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  )
}

export default function HeadsUpBand({ data, openEvidence, onScrollTo, windowKey, anchorDate }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  onScrollTo: (id: string) => void
  windowKey: TimeWindowKey
  anchorDate: string | null
}) {
  const { balance, evidenceById } = data
  const headsUp = useMemo(
    () => data.headsUp.filter(c => withinWindow(c.dateISO, anchorDate, windowKey)),
    [data.headsUp, anchorDate, windowKey],
  )

  const accounts = useMemo(
    () => data.quarters.map(q => ({ id: q.accountId, name: q.accountName, color: q.accentColor })),
    [data.quarters],
  )

  const nbaSegments = useMemo(
    () => accounts.map((a, i) => ({ key: a.id, label: a.name, value: data.nba.filter(n => n.accountId === a.id).length, color: rampColor(PIE_RAMP_NAVY, i) })).filter(s => s.value > 0),
    [accounts, data.nba],
  )
  const oppSegments = useMemo(() => [
    { key: 'opp', label: 'Opportunity', value: balance.opportunityCount, color: PIE_RAMP_NAVY[0] },
    { key: 'risk', label: 'Risk', value: balance.riskCount, color: PIE_RAMP_NAVY[1] },
  ].filter(s => s.value > 0), [balance])

  const openPolarityBucket = (key: string) => {
    const ids = (key === 'risk' ? balance.riskEvidenceIds: balance.opportunityEvidenceIds).slice(0, 8)
    openEvidence('Organization', key === 'risk' ? 'Open Risks & Missed Opportunities': 'Open Opportunities', ids.map(id => evidenceById[id]).filter(Boolean) as EvidenceItem[])
  }

  return (
    <section style={{
      background: 'linear-gradient(155deg, #1c3155 0%, #24406e 100%)', borderRadius: 'var(--radius-xl)',
      padding: '30px 30px 26px', color: '#fff', position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(212,175,55,0.22)',
    }}>
      <div style={{ position: 'absolute', top: '-30%', right: '-8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>Executive Insight</h1>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 20 }}>
          <MiniDashboard icon={ListChecks} title="Next Best Actions" segments={nbaSegments}
            centerLabel={String(data.nba.length)} centerSub="actions"
            onSegmentClick={() => onScrollTo('home-nba')} onViewAll={() => onScrollTo('home-nba')} />
          <MiniDashboard icon={Scale} title="Opportunity vs. Risk" segments={oppSegments}
            centerLabel={String(balance.opportunityCount + balance.riskCount)} centerSub="signals"
            onSegmentClick={openPolarityBucket} onViewAll={() => onScrollTo('home-opportunity')} />
        </div>

        {headsUp.length === 0 ? (
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 22 }}>
            No high-priority items in this window{anchorDate ? ` (as of ${anchorDate})`: ''}: try a wider window.
          </div>
        ): (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff', marginTop: 22, marginBottom: 10 }}>
              Top priority
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="home-heads-up-grid">
              {headsUp.map(chip => {
                const Icon = chip.polarity === 'Opportunity' ? TrendingUp: chip.polarity === 'Risk' ? TrendingDown: ArrowLeftRight
                const ev = evidenceById[chip.evidenceId]
                return (
                  <button key={chip.evidenceId}
                    onClick={() => { if (ev) openEvidence(chip.accountName, ev.title, [ev]) }}
                    className="card card-clickable"
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', cursor: 'pointer',
                      background: '#ffffff', borderRadius: 14, padding: '18px', minHeight: 168,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--navy-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color="var(--navy)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 5 }}>{chip.accountName}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.4, color: 'var(--text-1)' }}>{chip.title}</div>
                      </div>
                      {chip.urgency === 'High' && <AlertTriangle size={14} color="var(--gold-muted)" style={{ flexShrink: 0, marginTop: 2 }} />}
                    </div>
                    {ev?.so_what && (
                      <div style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 8 }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 2 }}>Why it matters</div>
                        <Bullets items={ev.so_what} compact clamp={2} style={{ marginTop: 4 }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 4 }}>
                      {ev?.categoryLabel && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--navy-faint)', color: 'var(--navy)' }}>{ev.categoryLabel}</span>
                      )}
                      {chip.confidence && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--gold-light)', color: 'var(--gold-muted)' }}>{chip.confidence} confidence</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
