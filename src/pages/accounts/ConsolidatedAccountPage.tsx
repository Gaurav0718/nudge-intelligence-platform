import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, TrendingUp, BarChart3, CheckCircle2, Target, Zap, DollarSign, Users } from 'lucide-react'
import { SectionHeading, Card, Badge, RagDot, RAG_META, AccentCallout } from '../../components/shared/ui'
import { accountById } from '../../data/shared'
import { ACCOUNT_INFO, ACCOUNTS_LIST } from '../../data/growthIndex'
import { metricsForAccount } from '../../data/marketing.seed'
import { STRATEGIC_HYPOTHESES } from '../../data/competition.seed'
import { crossModuleFor } from '../../lib/crossModule'

export default function ConsolidatedAccountPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const acc = accountById(id)
  const listItem: any = ACCOUNTS_LIST.find((a: any) => a.id === id)
  const info: any = ACCOUNT_INFO[id]
  const x = crossModuleFor(id)

  if (!acc) return (
    <div>
      <SectionHeading eyebrow="Account Intelligence" title="Account not found" sub="Return to the command center." />
      <button className="btn btn-navy" onClick={() => nav('/accounts')}><ArrowLeft size={14} /> Back to Accounts</button>
    </div>
  )

  const rev = listItem?.revenues || {}
  const mkt = metricsForAccount(id)[0]
  const hyps = STRATEGIC_HYPOTHESES.filter(h => h.account_ids?.includes(id))
  const recos: any[] = info?.nextBestAction || info?.strategicPriorities || []
  const priorities: string[] = info?.emergingPriorities || []

  const MODULES = [
    {
      key: 'growth', title: 'Sales & Growth', icon: TrendingUp, to: `/accounts/${id}/growth`,
      metrics: [['3-Yr Target', rev.target3yr ?? acc.three_year_target ?? 'N/A'], ['Execs mapped', String(listItem?.executivesMapped ?? '—')]],
      insight: listItem?.strategicPosture || acc.strategic_posture_text || '',
    },
    {
      key: 'marketing', title: 'Marketing & Service Line', icon: BarChart3, to: `/marketing/account-pulse?account=${id}`,
      metrics: [['Share of voice', x.shareOfVoice != null ? `${x.shareOfVoice}%` : '—'], ['Top line', mkt ? mkt.service_line : '—']],
      insight: mkt ? `#${mkt.visibility_position} visibility · ${mkt.total_mentions} mentions across ${mkt.competitors_active} active competitors (${mkt.time_window}).` : 'No market metrics yet.',
    },
    {
      key: 'delivery', title: 'Delivery Health', icon: CheckCircle2, to: `/delivery-health/accounts`,
      metrics: [['Health', RAG_META[x.deliveryRag].label], ['Critical', String(x.deliveryCounts.Critical)]],
      insight: `${x.deliveryCounts.Critical} critical · ${x.deliveryCounts.NeedsAttention} need attention · ${x.deliveryCounts.Stable} stable across tracked engagements.`,
      rag: x.deliveryRag,
    },
    {
      key: 'competition', title: 'Competition', icon: Target, to: `/competition`,
      metrics: [['Open signals', String(x.openCompetitionSignals)], ['Hypotheses', String(hyps.length)]],
      insight: hyps[0]?.title || 'Cross-competitor pressure tracked across the field.',
    },
  ]

  return (
    <div>
      {/* Back + switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => nav('/accounts')}><ArrowLeft size={15} /> Accounts</button>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ACCOUNTS_LIST.map((a: any) => (
            <button key={a.id} onClick={() => nav(`/accounts/${a.id}`)}
              className={`pill-filter${a.id === id ? ' active' : ''}`}>{a.name}</button>
          ))}
        </div>
      </div>

      {/* Exec hero */}
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ height: 5, background: acc.accent_color }} />
        <div style={{ padding: 24, display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: acc.accent_color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, flexShrink: 0 }}>{acc.logo_letter}</div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Account Intelligence · Consolidated view</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', margin: '4px 0 8px' }}>{acc.name}</h1>
            <Badge color="gold">{info?.posture?.label || acc.posture_label}</Badge>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '12px 0 0', maxWidth: 820 }}>
              {info?.accountContext ? String(info.accountContext).split('. ').slice(0, 2).join('. ') + '.' : acc.strategic_posture_text}
            </p>
          </div>
          <button className="btn btn-navy" onClick={() => nav(`/accounts/${id}/report`)}
            style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            View Full Account Report <ArrowRight size={14} />
          </button>
        </div>
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1, background: 'var(--border)', borderTop: '1px solid var(--border)' }}>
          <Kpi icon={<DollarSign size={13} />} label="3-Year Target" value={rev.target3yr ?? acc.three_year_target ?? 'N/A'} />
          <Kpi icon={<RagDot status={x.deliveryRag} size={11} />} label="Delivery Health" value={RAG_META[x.deliveryRag].label} color={RAG_META[x.deliveryRag].color} />
          <Kpi icon={<BarChart3 size={13} />} label="Share of Voice" value={x.shareOfVoice != null ? `${x.shareOfVoice}%` : '—'} />
          <Kpi icon={<Target size={13} />} label="Open Comp Signals" value={String(x.openCompetitionSignals)} />
          <Kpi icon={<Users size={13} />} label="Execs Mapped" value={String(listItem?.executivesMapped ?? '—')} />
        </div>
      </Card>

      {/* Module grid */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 12 }}>Intelligence Modules</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 26, alignItems: 'stretch' }}>
        {MODULES.map(m => {
          const Icon = m.icon
          return (
            <Card key={m.key} clickable onClick={() => nav(m.to)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--navy-faint)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={19} /></div>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)' }}>{m.title}</div>
                {'rag' in m && m.rag && <RagDot status={m.rag as any} size={11} />}
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {m.metrics.map(([l, v], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>{v}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.insight}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open module <ArrowRight size={13} /></div>
            </Card>
          )
        })}
      </div>

      {/* AI summary */}
      {info?.nudgeSignal && (
        <Card style={{ marginBottom: 26, borderLeft: '4px solid var(--gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Zap size={16} style={{ color: 'var(--gold-muted)' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)' }}>Executive AI Summary</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{info.nudgeSignal}</p>
          {priorities.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              {priorities.slice(0, 4).map((p, i) => (
                <span key={i} style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 11px', borderRadius: 8, background: 'var(--navy-faint)', color: 'var(--navy)' }}>{p.length > 60 ? p.slice(0, 58) + '…' : p}</span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Recommendations */}
      {recos.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>Executive Recommendations</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· ranked by urgency</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recos.slice(0, 5).map((r, i) => (
              <Card key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{r.action || r.title || r.priority}</span>
                    {(r.urgency || r.priority) && <Badge color={/immediate|urgent|most|critical/i.test(String(r.urgency || r.priority)) ? 'red' : 'amber'}>{r.urgency || r.priority}</Badge>}
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55, margin: 0 }}>{r.detail || r.body || r.freyrAction || ''}</p>
                  {r.owner && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>Owner: {r.owner}</div>}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 20, fontSize: 12.5, color: 'var(--text-3)' }}>
        Deep dive: <Link to={`/accounts/${id}/growth`} style={{ color: 'var(--navy)', fontWeight: 600 }}>Sales &amp; Growth dossier</Link> · <Link to="/accounts/exec-capital" style={{ color: 'var(--navy)', fontWeight: 600 }}>Exec Capital</Link> · <Link to="/accounts/planning" style={{ color: 'var(--navy)', fontWeight: 600 }}>Account Planning</Link>
      </div>
    </div>
  )
}

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg-surface)', padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || 'var(--navy)' }}>{value}</div>
    </div>
  )
}
