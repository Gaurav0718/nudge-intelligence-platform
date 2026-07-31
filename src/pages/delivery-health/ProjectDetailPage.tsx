import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, ArrowRight, Check, Building2, Calendar } from 'lucide-react'
import './deliveryTheme.css'
import { DhRagBadge, DhConfidence, RagLogicInfo, FAMILY_ICON, groupByFamily, allMetrics, projectRag, type Metric } from './deliveryUi'
import { engagementById, ragOf, ragLabel, SIGNAL_FAMILY_LABEL, type ImpactLevel, type RecoveryIntervention } from '../../data/delivery.seed'
import { accountById, serviceLineLabel } from '../../data/shared'
import { promoteToInitiative, upsertInitiative, allInitiatives } from '../../lib/initiatives'
import { interventionStatus } from './deliveryData'
import { useToast } from '../../hooks/useToast'
import ToastHost from '../../components/shared/ToastHost'

const IMPACT_ORDER = ['revenue', 'margin', 'compliance', 'reputation', 'people'] as const
const IMPACT_LABEL: Record<string, string> = { revenue: 'Revenue', margin: 'Margin', compliance: 'Compliance', reputation: 'Reputation', people: 'People' }
const IMPACT_COLOR: Record<ImpactLevel, string> = { High: 'var(--dh-error)', Medium: 'var(--dh-warning)', Low: 'var(--dh-success)' }
const IMPACT_WIDTH: Record<ImpactLevel, string> = { High: '88%', Medium: '52%', Low: '20%' }

export default function ProjectDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { toasts, push } = useToast()
  const [, force] = useState(0)
  const e = id ? engagementById(id) : undefined

  if (!e) return <div className="dh" style={{ padding: 20 }}><p className="t-secondary">Project not found. <button className="btn btn-ghost" onClick={() => nav('/delivery-health/projects')}>Back to projects</button></p></div>

  const account = accountById(e.account_id)
  const rag = ragOf(e.rag_status)
  const families = groupByFamily(e)
  const metrics = allMetrics(e)
  const nonStable = metrics.filter(m => m.status !== 'green').slice(0, 2)

  const ivStatusOf = (iv: RecoveryIntervention) => interventionStatus(iv)
  const awaiting = e.interventions.filter(iv => ivStatusOf(iv) === 'awaiting')
  const other = e.interventions.filter(iv => ivStatusOf(iv) !== 'awaiting')

  const setIv = (iv: RecoveryIntervention, status: 'InProgress' | 'Complete' | 'NotStarted') => {
    const existing = allInitiatives().find(i => i.source_id === iv.id)
    if (existing) upsertInitiative({ ...existing, status })
    else promoteToInitiative(iv.id, {
      title: iv.title, status, module: 'DeliveryHealth', source_type: 'DeliveryRisk',
      description: iv.rationale, execution_guidance: iv.expected_signal_improvement,
      primary_owner_name: iv.owner_name, target_completion_date: iv.due_date,
      service_line: e.service_line, account_id: e.account_id,
    })
    push(status === 'InProgress' ? `Accepted and assigned to ${iv.owner_name}` : status === 'NotStarted' ? 'Recommendation rejected' : 'Marked complete', status === 'NotStarted' ? 'info' : 'success')
    force(x => x + 1)
  }

  return (
    <div className="dh">
      <ToastHost toasts={toasts} />
      <button className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: 14 }} onClick={() => nav('/delivery-health/projects')}><ChevronDown size={15} style={{ transform: 'rotate(90deg)' }} /> Back to projects</button>

      {/* Header */}
      <div className="card section-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <span className="pill pill-navy">{account?.name}</span>
              <span className="pill pill-neutral">{serviceLineLabel(e.service_line)}</span>
            </div>
            <h1 className="t-card" style={{ fontSize: 24 }}>{e.name}</h1>
            <div className="t-secondary" style={{ marginTop: 6 }}>Delivery owner: <b style={{ color: 'var(--dh-text)', fontWeight: 500 }}>{e.delivery_lead}</b> &nbsp;·&nbsp; Account manager: <b style={{ color: 'var(--dh-text)', fontWeight: 500 }}>{e.account_manager ?? '—'}</b></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <span className="t-label-upper">Current health</span><RagLogicInfo />
            </div>
            <div style={{ marginTop: 6 }}><DhRagBadge rag={rag} /></div>
          </div>
        </div>
        <div className="divider" />
        <span className="t-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FileText size={15} /> Statement of work <ArrowRight size={13} /></span>
      </div>

      {/* Summary */}
      <div className="card section-block">
        <div className="section-head"><div><h2 className="t-subhead">Delivery health summary</h2></div></div>
        <p className="t-body" style={{ color: 'var(--dh-text-2)', fontStyle: 'italic' }}>
          "{rag === 'green' ? `${e.name} is Stable — no signal families currently show risk against target.` : `${ragLabel(rag)} — driven primarily by ${nonStable.map(m => m.name.toLowerCase()).join(' and ')}.`}"
        </p>
      </div>

      {/* Evidence pack */}
      <div className="section-block">
        <div className="section-head"><div><h2 className="t-subhead">Evidence pack &amp; signal families</h2><p className="t-secondary">Click any signal to see its source, confidence level and recent trend.</p></div></div>
        <div className="grid grid-2">
          {families.map(g => {
            const Icon = FAMILY_ICON[g.family]
            return (
              <div key={g.family} className="card" style={{ padding: '18px 20px' }}>
                <div className="family-title"><Icon size={17} /><h4>{SIGNAL_FAMILY_LABEL[g.family]}</h4></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {g.metrics.map((m, i) => <EvidenceCard key={i} m={m} />)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="card section-block">
        <h2 className="t-subhead">Signal timeline</h2>
        <p className="t-secondary" style={{ marginTop: 2 }}>The order signals changed — so the same early warning signs can be caught sooner next time.</p>
        <div className="timeline" style={{ marginTop: 18 }}>
          {e.timeline.map((t, i) => (
            <div key={i} className={`timeline-item${t.is_current ? ' current' : ''}`}>
              <div className="timeline-dot" />
              <div className="timeline-date">{fmt(t.event_date)} <span className="pill pill-neutral" style={{ marginLeft: 6 }}>{t.family ? SIGNAL_FAMILY_LABEL[t.family] : 'Status update'}</span></div>
              <div className="timeline-text">{t.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Root cause */}
      <div className="card section-block">
        <div className="section-head"><div><h2 className="t-subhead">Likely root cause</h2></div></div>
        <p className="t-body" style={{ color: 'var(--dh-text-2)' }}>{e.root_cause}</p>
      </div>

      {/* Business impact */}
      <div className="card section-block">
        <h2 className="t-subhead">Business impact</h2>
        <div className="grid grid-5" style={{ marginTop: 14 }}>
          {IMPACT_ORDER.map(k => {
            const lvl = e.business_impact[k]
            return (
              <div key={k} className="impact-card">
                <div className="impact-top"><span className="t-label" style={{ color: 'var(--dh-text)', fontWeight: 600 }}>{IMPACT_LABEL[k]}</span><span className="t-caption" style={{ color: IMPACT_COLOR[lvl], fontWeight: 600 }}>{lvl}</span></div>
                <div className="impact-bar"><span style={{ width: IMPACT_WIDTH[lvl], background: IMPACT_COLOR[lvl] }} /></div>
              </div>
            )
          })}
        </div>
        <p className="t-secondary" style={{ marginTop: 14, lineHeight: 1.6 }}>{e.business_impact_rationale}</p>
      </div>

      {/* Recommended recovery interventions */}
      <div className="section-block">
        <div className="section-head"><div><h2 className="t-subhead" style={{ fontSize: 20 }}>Recommended recovery interventions</h2></div>{other.length ? <span className="t-secondary">{other.length} already in motion — see Interventions</span> : null}</div>
        <div className={awaiting.length ? 'grid grid-2' : ''} style={{ alignItems: 'start' }}>
          {awaiting.length ? awaiting.map(iv => <RecCard key={iv.id} iv={iv} onAccept={() => setIv(iv, 'InProgress')} onReject={() => setIv(iv, 'NotStarted')} />)
            : <div className="card"><p className="t-secondary" style={{ margin: 0 }}>No open recommendations for this project right now.</p></div>}
        </div>
        {other.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {other.map(iv => {
              const st = ivStatusOf(iv)
              return <button key={iv.id} className={`pill ${st === 'accepted' ? 'pill-blue' : 'pill-neutral'}`} style={{ cursor: 'pointer', border: 0 }} onClick={() => nav('/delivery-health/actions')}>{iv.title} · {st === 'accepted' ? 'In progress' : st === 'completed' ? 'Completed' : 'Rejected'}</button>
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EvidenceCard({ m }: { m: Metric }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`evidence-card${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="evidence-row">
        <div style={{ flex: 1 }}><div className="evidence-name">{m.name}</div></div>
        <div style={{ textAlign: 'right' }}>
          <span className="evidence-value">{m.value}</span>
          {m.target && <div className="evidence-target">{m.target}</div>}
        </div>
        <span className={`rag-dot rag-${m.status}`} style={{ marginTop: 4 }} />
        <span className="evidence-chevron"><ChevronDown size={16} /></span>
      </div>
      <div className="evidence-note">{m.note}</div>
      {open && (
        <div className="evidence-extra">
          <div><span className="t-label-upper">Signal source</span><div className="t-secondary" style={{ marginTop: 2 }}>{m.source}</div></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <DhConfidence level={m.confidence} />
          </div>
          {m.trend && (
            <div className="trend-row"><span className="t-caption" style={{ marginRight: 4 }}>Last 3 cycles:</span>
              {m.trend.map((t, i) => <span key={i} className="trend-dot" style={{ background: t === 'red' ? 'var(--dh-error)' : t === 'amber' ? 'var(--dh-warning)' : 'var(--dh-success)' }} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RecCard({ iv, onAccept, onReject }: { iv: RecoveryIntervention; onAccept: () => void; onReject: () => void }) {
  return (
    <div className="rec-card">
      <div className="rec-top">
        <div><div className="t-card" style={{ fontSize: 17, marginTop: 4 }}>{iv.title}</div></div>
        <DhConfidence level={iv.confidence} />
      </div>
      <p className="t-secondary" style={{ margin: '6px 0 0' }}>{iv.rationale}</p>
      <div className="rec-meta">
        <span className="item"><Building2 size={15} /> Owner: <b>{iv.owner_name}</b></span>
        <span className="item"><Calendar size={15} /> Due: <b>{iv.due_date}</b></span>
      </div>
      <div className="rec-improve">Expected improvement: {iv.expected_signal_improvement}</div>
      <div className="t-label-upper" style={{ marginBottom: 5 }}>Evidence summary</div>
      <ul style={{ margin: '0 0 14px', paddingLeft: 18 }}>
        {iv.evidence_summary.map((ev, i) => <li key={i} className="t-secondary" style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 3 }}>{ev}</li>)}
      </ul>
      <div className="rec-actions">
        <button className="btn btn-danger btn-sm" onClick={onReject}>Reject</button>
        <button className="btn btn-primary btn-sm" onClick={onAccept}><Check size={14} /> Accept &amp; assign</button>
      </div>
    </div>
  )
}

const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
