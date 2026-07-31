import { useState } from 'react'
import { Radar, Lock, Repeat, Layers, Eye, Target, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import { SectionHeading, Card, EmptyState, Badge, ConfidencePill, AccentCallout } from '../../components/shared/ui'
import {
  COMPETITORS, RADAR_PATTERNS, RADAR_ACCOUNTS, STRATEGIC_HYPOTHESES, researchedCount,
} from '../../data/competition.seed'
import { COMPETITION_TABS } from './CompetitorListPage'

const PATTERN_ICON = { RecurringMove: Repeat, ServiceLinePattern: Layers, CompanyBlindSpot: Eye }

export default function StrategicRadarPage() {
  const nav = useNavigate()
  const [acct, setAcct] = useState<string | null>(null)
  const researched = researchedCount()
  const gated = researched < 2

  const compName = (id: string) => COMPETITORS.find(c => c.id === id)?.name ?? id
  const acctName = (id: string) => RADAR_ACCOUNTS.find(a => a.id === id)?.name ?? id

  const hypotheses = STRATEGIC_HYPOTHESES.filter(h => !acct || h.account_ids.includes(acct))

  return (
    <div>
      <SectionHeading eyebrow="Competition Module" title="Strategic Radar"
        sub="Account-tied competitor hypotheses with next best steps, plus cross-competitor pattern synthesis across the five priority accounts. Unlocks at 2+ researched profiles." />
      <ModuleTabBar tabs={COMPETITION_TABS} />

      {gated ? (
        <Card style={{ padding: 0 }}>
          <EmptyState icon={<Lock size={40} />} title="Strategic Radar is gated"
            sub={`Needs at least 2 researched competitor profiles. Currently ${researched} of ${COMPETITORS.length} researched.`} />
        </Card>
      ) : (
        <>
          {/* ── Account filter ─────────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase', marginRight: 4 }}>Account</span>
            <button className={`pill-filter${!acct ? ' active' : ''}`} onClick={() => setAcct(null)}>All accounts</button>
            {RADAR_ACCOUNTS.map(a => (
              <button key={a.id} className={`pill-filter${acct === a.id ? ' active' : ''}`} onClick={() => setAcct(a.id)}>{a.name}</button>
            ))}
          </div>

          {/* ── Hypotheses + next best steps ───────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Target size={16} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>Competitor Hypotheses &amp; Next Best Steps</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· {hypotheses.length} active{acct ? ` for ${acctName(acct)}` : ''}</span>
          </div>

          {hypotheses.length === 0 ? (
            <Card style={{ padding: 0, marginBottom: 28 }}>
              <EmptyState icon={<Radar size={36} />} title="No hypotheses for this account yet"
                sub="Select another account, or clear the filter to see all competitor hypotheses." />
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16, marginBottom: 30 }}>
              {hypotheses.map(h => (
                <Card key={h.id} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, borderTop: '3px solid var(--navy)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={() => nav(`/competition/${h.competitor_id}`)}
                      style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: 'var(--navy-faint)', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {compName(h.competitor_id)} <ArrowRight size={12} />
                    </button>
                    <ConfidencePill level={h.confidence} />
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {h.account_ids.map(id => (
                        <span key={id} style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: acct === id ? 'var(--navy)' : 'var(--gold-light)', color: acct === id ? '#fff' : 'var(--gold-muted)' }}>{acctName(id)}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.35 }}>{h.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{h.hypothesis}</p>

                  <AccentCallout tone="gold" label="Company angle">{h.indegene_angle}</AccentCallout>

                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Next best steps</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {h.next_best_steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                          <CheckCircle2 size={15} style={{ color: 'var(--navy)', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── Cross-competitor patterns ──────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Radar size={16} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>Cross-Competitor Patterns</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· recurring moves, service-line clusters &amp; Company blind spots</span>
          </div>
          {RADAR_PATTERNS.length === 0 ? (
            <Card style={{ padding: 0 }}>
              <EmptyState icon={<Radar size={40} />} title="No patterns detected yet" sub="Patterns surface as more signals accumulate." />
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {RADAR_PATTERNS.map(p => {
                const Icon = PATTERN_ICON[p.pattern_type]
                return (
                  <Card key={p.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--navy-faint)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} /></div>
                      <Badge color="navy">{p.pattern_type.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                    </div>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{p.title}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, margin: '0 0 12px' }}>{p.description}</p>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {p.contributing_competitor_ids.map(id => (
                        <span key={id} style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--bg-raised)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>{compName(id)}</span>
                      ))}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
