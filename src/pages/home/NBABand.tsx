import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { SectionHeading, EmptyState, ExpandableInsightCard, Pill, Card } from '../../components/shared/ui'
import { Bullets } from '../../components/shared/Bullets'
import type { OrganizationIntelligence, NBACard } from '../../lib/orgIntelligence'
import { promoteToInitiative, allInitiatives } from '../../lib/initiatives'
import { useToast } from '../../hooks/useToast'
import ToastHost from '../../components/shared/ToastHost'
import { PieChart, PIE_RAMP_NAVY, rampColor } from './charts'
import type { OpenEvidence } from './homeTypes'

const VISIBLE_DEFAULT = 5

function UrgencyPill({ u }: { u: 'High' | 'Medium' | 'Low' }) {
  const style = u === 'High'
    ? { background: 'var(--gold)', color: '#1B365D' }
   : u === 'Medium'
      ? { background: 'var(--gold-light)', color: 'var(--gold-muted)' }
     : { background: 'var(--navy-faint)', color: 'var(--navy)' }
  return <span style={{ ...style, display: 'inline-flex', padding: '3px 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>{u}</span>
}

export function NBACardList({ items, data, openEvidence, onPromote }: {
  items: NBACard[]
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  onPromote?: () => void
}) {
  const [showAll, setShowAll] = useState(false)
  const { toasts, push } = useToast()
  const [, force] = useState(0)
  const cards = (showAll ? items: items.slice(0, VISIBLE_DEFAULT)).map((c, i) => ({ ...c, rank: i + 1 }))
  const isPromoted = (id: string) => allInitiatives().some(i => i.source_id === id)

  const promote = (card: NBACard) => {
    promoteToInitiative(card.evidenceId, {
      title: card.action, status: 'NotStarted', module: 'Organization',
      source_type: 'HomeNextBestAction', description: card.because,
      service_line: card.serviceLineGuess ?? null, account_id: card.accountId,
    })
    push('Promoted — track it in the Promoted tab', 'success')
    force(x => x + 1)
    onPromote?.()
  }

  if (items.length === 0) return <EmptyState title="No recommended actions" sub="Nothing in the intelligence feed currently warrants action for this account." />

  return (
    <>
      <ToastHost toasts={toasts} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cards.map(card => {
          const promoted = isPromoted(card.evidenceId)
          return (
            <ExpandableInsightCard key={card.evidenceId} headerClassName="home-hover"
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--navy-faint)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{card.rank}</span>
                  {card.action}
                </span>
              }
              meta={
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--navy)' }} />{card.accountName}
                  </span>
                  {card.serviceLineGuess && <span style={{ color: 'var(--gold-muted)' }}>· {card.serviceLineGuess}</span>}
                  {promoted && <span style={{ color: 'var(--gold-muted)', fontWeight: 700 }}>· In initiatives</span>}
                </span>
              }
              badge={<UrgencyPill u={card.urgency} />}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 4 }}>Why now</div>
              <Bullets items={card.because} compact style={{ marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ fontSize: 12 }}
                  onClick={() => { const ev = data.evidenceById[card.evidenceId]; if (ev) openEvidence(card.accountName, ev.title, [ev]) }}>
                  Full evidence
                </button>
                <button className="btn" disabled={promoted}
                  style={{ fontSize: 12, background: promoted ? 'var(--gold-light)': 'var(--navy)', color: promoted ? 'var(--gold-muted)': '#fff', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  onClick={() => promote(card)}>
                  <CheckCircle2 size={13} /> {promoted ? 'Promoted': 'Promote'}
                </button>
              </div>
            </ExpandableInsightCard>
          )
        })}
      </div>

      {items.length > VISIBLE_DEFAULT && (
        <button onClick={() => setShowAll(s => !s)} className="btn btn-ghost"
          style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {showAll ? 'Show fewer': `Show all ${items.length}`}
          <ChevronDown size={14} style={{ transform: showAll ? 'rotate(180deg)': 'none', transition: 'transform 200ms' }} />
        </button>
      )}
    </>
  )
}

export default function NBABand({ data, openEvidence }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
}) {
  const accounts = useMemo(
    () => data.quarters.map(q => ({ id: q.accountId, name: q.accountName, color: q.accentColor })),
    [data.quarters],
  )
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null)

  const forAccount = accountId ? data.nba.filter(n => n.accountId === accountId): []

  // Light card surface → navy-only ramp.
  const pieSegments = accounts.map((a, i) => ({
    key: a.id, label: a.name, value: data.nba.filter(n => n.accountId === a.id).length, color: rampColor(PIE_RAMP_NAVY, i),
  })).filter(s => s.value > 0)

  const promoted = allInitiatives().filter(i => i.module === 'Organization' && i.source_type === 'HomeNextBestAction')

  return (
    <section id="home-nba">
      <SectionHeading eyebrow="10 · Act" title="Next Best Actions"
        sub="Ranked by urgency and confidence, one account at a time. Expand a card for the reasoning, promote to open it as a tracked initiative." />

      {pieSegments.length > 0 && (
        <Card style={{ padding: '20px 26px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>Actions by Account</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Click a slice to jump to that account's action list</div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 auto' }}>
              <PieChart segments={pieSegments} size={180} onSegmentClick={setAccountId} showLegend={false} solid />
            </div>
            <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 240 }}>
              {pieSegments.map(s => {
                const pct = Math.round((s.value / data.nba.length) * 100)
                return (
                  <button key={s.key} onClick={() => setAccountId(s.key)} className="home-hover"
                    style={{ display: 'flex', flexDirection: 'column', gap: 5, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', padding: '8px 10px', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-2)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: accountId === s.key ? 700: 600 }}>
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
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {accounts.map(a => (
            <Pill key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)}>{a.name}</Pill>
          ))}
        </div>

        <div style={{ flex: '0 0 260px', minWidth: 220, border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', background: 'var(--bg-raised)' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>
            Promoted ({promoted.length})
          </div>
          {promoted.length === 0 ? (
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Nothing promoted yet: promote an action below to track it here.</div>
          ): (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {promoted.slice(0, 4).map(i => (
                <button key={i.id} className="home-hover"
                  onClick={() => { const ev = i.source_id ? data.evidenceById[i.source_id]: null; if (ev) openEvidence(ev.accountName ?? '', ev.title, [ev]) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, fontSize: 11.5, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {i.title}
                </button>
              ))}
              {promoted.length > 4 && <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>+{promoted.length - 4} more</div>}
            </div>
          )}
        </div>
      </div>

      <NBACardList items={forAccount} data={data} openEvidence={openEvidence} />
    </section>
  )
}
