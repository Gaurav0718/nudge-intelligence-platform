import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import './deliveryTheme.css'
import { DeliveryTabs, DhRagBadge, DhConfidence } from './deliveryUi'
import { ENGAGEMENTS, ragOf, insightsForAccount, type InsightCardData } from '../../data/delivery.seed'
import { CORE_ACCOUNTS, accountById, serviceLineLabel } from '../../data/shared'

export default function AccountsHealthPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const initial = params.get('account') && accountById(params.get('account')!) ? params.get('account')! : CORE_ACCOUNTS[0].id
  const [account, setAccount] = useState(initial)

  const acc = accountById(account)!
  const projects = ENGAGEMENTS.filter(e => e.account_id === account)
  const red = projects.filter(e => ragOf(e.rag_status) === 'red').length
  const amber = projects.filter(e => ragOf(e.rag_status) === 'amber').length
  const green = projects.filter(e => ragOf(e.rag_status) === 'green').length
  const ins = insightsForAccount(account)
  const riskProjects = projects.filter(e => ragOf(e.rag_status) !== 'green')

  return (
    <div className="dh">
      <div style={{ marginBottom: 18 }}>
        <div className="t-secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dh-gold-text)' }}>Delivery Health Module</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: '4px 0 6px', color: 'var(--dh-text)' }}>Account Health</h1>
        <p className="t-secondary" style={{ maxWidth: 760 }}>Per-account delivery posture with three synthesized insight cards — what stakeholders expect next, what's at risk, and what's working.</p>
      </div>
      <DeliveryTabs />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {CORE_ACCOUNTS.map(a => (
          <button key={a.id} className={`tab${account === a.id ? ' active' : ''}`} style={{ border: '1px solid var(--dh-border)' }} onClick={() => setAccount(a.id)}>{a.name}</button>
        ))}
      </div>

      {/* Header + counts */}
      <div className="card section-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: acc.accent_color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>{acc.logo_letter}</div>
            <div>
              <h2 className="t-card" style={{ fontSize: 22 }}>{acc.name}</h2>
              <div className="t-secondary">{projects.length} tracked engagements</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 22 }}>
            <Count n={red} label="Critical" color="var(--dh-status-red)" />
            <Count n={amber} label="Needs attention" color="var(--dh-status-amber)" />
            <Count n={green} label="Stable" color="var(--dh-status-green)" />
          </div>
        </div>
      </div>

      {/* Insight cards */}
      {ins && (
        <div className="grid grid-3 section-block">
          <InsightCard icon={<TrendingUp size={16} />} title="Priorities" subtitle="What stakeholders expect next" data={ins.priorities} accent="var(--dh-az-info)" />
          <InsightCard icon={<AlertTriangle size={16} />} title="Concerns" subtitle="What is at risk" data={ins.concerns} accent="var(--dh-status-red)" />
          <InsightCard icon={<CheckCircle2 size={16} />} title="Positive Signals" subtitle="What is working" data={ins.positive} accent="var(--dh-status-green)" />
        </div>
      )}

      {/* Risk projects */}
      <div className="section-block">
        <div className="section-head"><div><h2 className="t-section">Projects needing attention</h2><p className="t-secondary">Critical and needs-attention engagements for {acc.name}.</p></div></div>
        {riskProjects.length ? (
          <div className="grid grid-2">
            {riskProjects.map(e => (
              <div key={e.id} className="project-card" onClick={() => nav(`/delivery-health/engagement/${e.id}`)}>
                <div className="project-card-top">
                  <span className="pill pill-neutral">{serviceLineLabel(e.service_line)}</span>
                  <DhRagBadge rag={ragOf(e.rag_status)} />
                </div>
                <h4>{e.name}</h4>
                <div className="t-secondary" style={{ marginBottom: 8 }}>Owner: {e.delivery_lead}</div>
                <div className="t-secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>{e.root_cause.slice(0, 130)}…</div>
                <div style={{ marginTop: 10, color: 'var(--dh-link)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>View evidence <ArrowRight size={13} /></div>
              </div>
            ))}
          </div>
        ) : <div className="card"><p className="t-secondary" style={{ margin: 0 }}>No critical or at-risk projects for {acc.name} right now.</p></div>}
      </div>
    </div>
  )
}

function Count({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{n}</div>
      <div className="t-caption" style={{ marginTop: 4 }}>{label}</div>
    </div>
  )
}

function InsightCard({ icon, title, subtitle, data, accent }: { icon: React.ReactNode; title: string; subtitle: string; data: InsightCardData; accent: string }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${accent}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: accent }}>{icon}<span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span></div>
      <div className="t-caption">{subtitle}</div>
      <div className="t-card" style={{ fontSize: 16 }}>{data.title}</div>
      <DhConfidence level={data.confidence} />
      <p className="t-secondary" style={{ lineHeight: 1.55 }}>{data.text}</p>
      <div style={{ borderTop: '1px dashed var(--dh-border)', paddingTop: 10, marginTop: 'auto' }}>
        <div className="t-label-upper" style={{ marginBottom: 5 }}>Evidence</div>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {data.evidence.map((ev, i) => <li key={i} className="t-secondary" style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 3 }}>{ev}</li>)}
        </ul>
      </div>
    </div>
  )
}
