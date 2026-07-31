import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Sparkles, Linkedin, Target, CheckCircle2 } from 'lucide-react'
import { Badge, Card, AvatarInitials, ConfidencePill, AccentCallout, EmptyState, ExpandableInsightCard } from '../../components/shared/ui'
import { Bullets } from '../../components/shared/Bullets'
import {
  COMPETITORS, DIFFERENTIATORS, STRATEGIC_MOVES, POSITIONING, SIGNALS, RELATIONSHIPS, QUESTIONS,
  STRATEGIC_HYPOTHESES, RADAR_ACCOUNTS,
} from '../../data/competition.seed'

export default function CompetitorDetailPage() {
  const { competitorId } = useParams()
  const nav = useNavigate()
  const c = COMPETITORS.find(x => x.id === competitorId)
  const positioning = POSITIONING.filter(p => p.competitor_id === competitorId)
  const [slTab, setSlTab] = useState(positioning[0]?.service_line ?? '')

  if (!c) return <EmptyState title="Competitor not found" sub="Return to the competitor list." />

  const diffs = DIFFERENTIATORS.filter(d => d.competitor_id === c.id)
  const moves = STRATEGIC_MOVES.filter(m => m.competitor_id === c.id)
  const signals = SIGNALS.filter(s => s.competitor_id === c.id)
  const rels = RELATIONSHIPS.filter(r => r.competitor_id === c.id)
  const keyLeaders = rels.filter(r => r.relationship_type === 'KeyLeader')
  const contacts = rels.filter(r => r.relationship_type !== 'KeyLeader')
  const questions = QUESTIONS.filter(q => q.competitor_id === c.id)
  const hyps = STRATEGIC_HYPOTHESES.filter(h => h.competitor_id === c.id)
  const acctName = (id: string) => RADAR_ACCOUNTS.find(a => a.id === id)?.name ?? id
  const researched = c.research_status === 'Researched'
  const activeSl = positioning.find(p => p.service_line === slTab) ?? positioning[0]

  return (
    <div>
      <button onClick={() => nav('/competition')} className="btn btn-ghost" style={{ marginBottom: 18 }}>
        <ArrowLeft size={15} /> All competitors
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 20, flexWrap: 'wrap' }}>
        <AvatarInitials text={c.name} color="var(--navy)" size={60} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28 }}>{c.name}</h1>
            <Badge color={researched ? 'emerald' : 'amber'}>{researched ? 'Researched' : 'In development'}</Badge>
            {c.corporate_synthesis_confidence && <ConfidencePill level={c.corporate_synthesis_confidence} />}
          </div>
          {c.website_url && <a href={c.website_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--navy)', display: 'inline-flex', gap: 5, alignItems: 'center', marginTop: 6 }}>{c.website_url} <ExternalLink size={12} /></a>}
        </div>
      </div>

      {!researched && (
        <AccentCallout tone="gold" label="Research in development" icon={<Sparkles size={13} />}>
          Corporate synthesis for {c.name} is still being assembled from open-source signals. Mapped across {c.mapped_service_lines.length} service lines
          ({c.mapped_service_lines.join(', ')}). The sections below populate as research completes.
        </AccentCallout>
      )}

      {researched && (
        <>
          <Card style={{ marginTop: 6, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 10 }}>Corporate Synthesis</div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-1)', margin: 0 }}>{c.corporate_posture}</p>
          </Card>

          <SectionLabel>Key Differentiators</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 26 }}>
            {diffs.map(d => (
              <Card key={d.id} style={{ padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>{d.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{d.description}</div>
              </Card>
            ))}
          </div>

          <SectionLabel>Strategic Moves</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14, marginBottom: 26, alignItems: 'start' }}>
            {moves.map(m => (
              <ExpandableInsightCard key={m.id} title={m.title}
                badge={<ConfidencePill level={m.confidence} />}
                meta={`${m.featured_signal_ids.length} featured signals`} defaultOpen>
                <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, marginTop: 10 }}>{m.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {m.featured_signal_ids.map(sid => {
                    const s = signals.find(x => x.id === sid)
                    return s ? <span key={sid} style={{ fontSize: 11.5, padding: '4px 10px', borderRadius: 8, background: 'var(--navy-faint)', color: 'var(--navy)' }}>{s.headline.slice(0, 48)}…</span> : null
                  })}
                </div>
              </ExpandableInsightCard>
            ))}
          </div>

          {positioning.length > 0 && (
            <>
              <SectionLabel>Service-Line Positioning</SectionLabel>
              <Card style={{ marginBottom: 26, padding: 0 }}>
                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', padding: '4px 8px 0', overflowX: 'auto' }}>
                  {positioning.map(p => (
                    <button key={p.id} onClick={() => setSlTab(p.service_line)}
                      className={`module-tab${activeSl?.service_line === p.service_line ? ' active' : ''}`}>{p.service_line}</button>
                  ))}
                </div>
                {activeSl && (
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>{activeSl.service_line}</div>
                      <ConfidencePill level={activeSl.confidence} />
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.7, marginBottom: 16 }}>{activeSl.positioning_summary}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      {activeSl.supporting_points.map((sp, i) => (
                        <div key={i} style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: 14 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{sp.title}</div>
                          <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.5 }}>{sp.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          <SectionLabel>Recent Signals</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12, marginBottom: 26, alignItems: 'start' }}>
            {signals.map(s => (
              <Card key={s.id} style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <Badge color="navy">{s.signal_type}</Badge>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.signal_date} · {s.source_name}</span>
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{s.headline}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 4 }}><strong>What happened:</strong> {s.what_happened}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--navy)' }}>Why it matters:</strong> <Bullets items={s.why_it_matters} compact style={{ marginTop: 4 }} />
                </div>
              </Card>
            ))}
          </div>

          {contacts.length > 0 && (
            <>
              <SectionLabel>Relationships & Key Leaders</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
                {contacts.map(r => (
                  <Card key={r.id} style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <AvatarInitials text={r.person_name} color="var(--navy-mid)" size={36} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>{r.person_name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{r.title}{r.company ? ` · ${r.company}` : ''}</div>
                      </div>
                    </div>
                    <Badge color={r.relationship_type === 'Champion' ? 'emerald' : r.relationship_type === 'ActiveEngagement' ? 'blue' : 'amber'} style={{ marginBottom: 8 }}>
                      {r.relationship_type.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                    <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55 }}>{r.description}</p>
                    {r.linkedin_url && <a href={r.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--navy)', display: 'inline-flex', gap: 5, alignItems: 'center', marginTop: 8 }}><Linkedin size={12} /> LinkedIn</a>}
                  </Card>
                ))}
              </div>
            </>
          )}
          {keyLeaders.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 26 }}>
              {keyLeaders.map(r => (
                <div key={r.id} style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)' }}>{r.person_name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 6 }}>{r.title}</div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55 }}>{r.description}</p>
                </div>
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <>
              <SectionLabel>Questions for Company</SectionLabel>
              <Card style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {questions.map(q => (
                    <div key={q.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'var(--navy-faint)', color: 'var(--navy)', flexShrink: 0 }}>{q.service_line}</span>
                      <span style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.55 }}>{q.question_text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {hyps.length > 0 && (
            <>
              <SectionLabel>Strategic Hypotheses &amp; Next Best Steps</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 20 }}>
                {hyps.map(h => (
                  <Card key={h.id} style={{ padding: 16, borderTop: '3px solid var(--navy)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <Target size={15} style={{ color: 'var(--navy)' }} />
                      <ConfidencePill level={h.confidence} />
                      {h.account_ids.map(id => (
                        <span key={id} style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'var(--gold-light)', color: 'var(--gold-muted)' }}>{acctName(id)}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6, lineHeight: 1.35 }}>{h.title}</div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 10px' }}>{h.hypothesis}</p>
                    <AccentCallout tone="gold" label="Company angle">{h.indegene_angle}</AccentCallout>
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {h.next_best_steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <CheckCircle2 size={14} style={{ color: 'var(--navy)', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.5 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--text-3)' }}>
        Related: <Link to="/competition/signals" style={{ color: 'var(--navy)', fontWeight: 600 }}>Signal Feed</Link> · <Link to="/competition/radar" style={{ color: 'var(--navy)', fontWeight: 600 }}>Strategic Radar</Link>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', margin: '4px 0 12px' }}>{children}</div>
}
