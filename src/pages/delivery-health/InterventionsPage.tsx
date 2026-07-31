import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Calendar, Check, CheckCircle2, RotateCcw } from 'lucide-react'
import './deliveryTheme.css'
import { DeliveryTabs, DhConfidence, DhRagDot } from './deliveryUi'
import { ragOf, type RecoveryIntervention } from '../../data/delivery.seed'
import { accountById, serviceLineLabel, SERVICE_LINES, ALL_ACCOUNTS } from '../../data/shared'
import { allIvRows, type IvStatus, type IvRow } from './deliveryData'
import { promoteToInitiative, upsertInitiative, allInitiatives } from '../../lib/initiatives'
import { useToast } from '../../hooks/useToast'
import ToastHost from '../../components/shared/ToastHost'

const TABS: { id: IvStatus; label: string }[] = [
  { id: 'awaiting', label: 'Awaiting Review' },
  { id: 'accepted', label: 'Accepted / In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected' },
]

export default function InterventionsPage() {
  const nav = useNavigate()
  const { toasts, push } = useToast()
  const [tab, setTab] = useState<IvStatus>('awaiting')
  const [account, setAccount] = useState('All')
  const [sl, setSl] = useState('All')
  const [owner, setOwner] = useState('All')
  const [, force] = useState(0)

  let rows = allIvRows()
  const owners = Array.from(new Set(rows.map(r => r.iv.owner_name)))
  rows = rows.filter(r =>
    (account === 'All' || r.engagement.account_id === account) &&
    (sl === 'All' || r.engagement.service_line === sl) &&
    (owner === 'All' || r.iv.owner_name === owner))

  const counts = TABS.reduce((a, t) => { a[t.id] = rows.filter(r => r.status === t.id).length; return a }, {} as Record<IvStatus, number>)
  const shown = rows.filter(r => r.status === tab)

  const setIv = (r: IvRow, status: 'InProgress' | 'Complete' | 'NotStarted') => {
    const iv = r.iv
    const existing = allInitiatives().find(i => i.source_id === iv.id)
    if (existing) upsertInitiative({ ...existing, status })
    else promoteToInitiative(iv.id, {
      title: iv.title, status, module: 'DeliveryHealth', source_type: 'DeliveryRisk',
      description: iv.rationale, execution_guidance: iv.expected_signal_improvement,
      primary_owner_name: iv.owner_name, target_completion_date: iv.due_date,
      service_line: r.engagement.service_line, account_id: r.engagement.account_id,
    })
    push(status === 'InProgress' ? `Accepted and assigned to ${iv.owner_name}` : status === 'Complete' ? 'Intervention marked complete' : 'Recommendation rejected', status === 'NotStarted' ? 'info' : 'success')
    force(x => x + 1)
  }

  return (
    <div className="dh">
      <div style={{ marginBottom: 18 }}>
        <div className="t-secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dh-gold-text)' }}>Delivery Health Module</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: '4px 0 6px', color: 'var(--dh-text)' }}>Interventions</h1>
        <p className="t-secondary" style={{ maxWidth: 760 }}>The recovery-intervention hub. Accepting a recommendation writes to the shared initiatives table (module = DeliveryHealth) and flows across the platform.</p>
      </div>
      <DeliveryTabs />
      <ToastHost toasts={toasts} />

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="field-row">
          <div className="field"><label>Account</label>
            <select className="select" value={account} onChange={e => setAccount(e.target.value)}>
              <option value="All">All</option>
              {ALL_ACCOUNTS.filter(a => a.is_core_demo_account).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Service line</label>
            <select className="select" value={sl} onChange={e => setSl(e.target.value)}>
              <option value="All">All</option>
              {SERVICE_LINES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="field"><label>Owner</label>
            <select className="select" value={owner} onChange={e => setOwner(e.target.value)}>
              <option value="All">All</option>
              {owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="tabs" style={{ marginTop: 16, marginBottom: 0 }}>
          {TABS.map(t => <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label} ({counts[t.id]})</button>)}
        </div>
      </div>

      {shown.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {shown.map(r => <IvCard key={r.iv.id} r={r} tab={tab} onSet={setIv} nav={nav} />)}
        </div>
      ) : <div className="card"><p className="t-secondary" style={{ margin: 0 }}>Nothing in this view.</p></div>}
    </div>
  )
}

function IvCard({ r, tab, onSet, nav }: { r: IvRow; tab: IvStatus; onSet: (r: IvRow, s: 'InProgress' | 'Complete' | 'NotStarted') => void; nav: (p: string) => void }) {
  const iv: RecoveryIntervention = r.iv
  const acc = accountById(r.engagement.account_id)
  return (
    <div className="rec-card">
      <div className="rec-top">
        <div>
          <div className="t-card" style={{ fontSize: 17 }}>{iv.title}</div>
          <div className="t-secondary" style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <DhRagDot rag={ragOf(r.engagement.rag_status)} />
            <button onClick={() => nav(`/delivery-health/engagement/${r.engagement.id}`)} style={{ color: 'var(--dh-link)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{r.engagement.name}</button>
            {' · '}{acc?.name} · {serviceLineLabel(r.engagement.service_line)}
          </div>
        </div>
        <DhConfidence level={iv.confidence} />
      </div>
      <p className="t-secondary" style={{ margin: '8px 0' }}>{iv.rationale}</p>
      <div className="rec-meta">
        <span className="item"><Building2 size={15} /> Owner: <b>{iv.owner_name}</b></span>
        <span className="item"><Calendar size={15} /> Due: <b>{iv.due_date}</b></span>
      </div>
      <div className="rec-improve">Expected improvement: {iv.expected_signal_improvement}</div>
      <div className="rec-actions">
        {tab === 'awaiting' && <>
          <button className="btn btn-danger btn-sm" onClick={() => onSet(r, 'NotStarted')}>Reject</button>
          <button className="btn btn-primary btn-sm" onClick={() => onSet(r, 'InProgress')}><Check size={14} /> Accept &amp; assign</button>
        </>}
        {tab === 'accepted' && <>
          <button className="btn btn-secondary btn-sm" onClick={() => onSet(r, 'NotStarted')}>Reject</button>
          <button className="btn btn-primary btn-sm" onClick={() => onSet(r, 'Complete')}><CheckCircle2 size={14} /> Mark complete</button>
        </>}
        {(tab === 'completed' || tab === 'rejected') && (
          <button className="btn btn-secondary btn-sm" onClick={() => onSet(r, 'InProgress')}><RotateCcw size={14} /> Reopen</button>
        )}
      </div>
    </div>
  )
}
