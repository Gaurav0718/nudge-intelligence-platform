import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './deliveryTheme.css'
import { DeliveryTabs, DhRagBadge, RagLogicInfo } from './deliveryUi'
import { ENGAGEMENTS, ragOf, ALL_SIGNAL_FAMILIES, SIGNAL_FAMILY_LABEL } from '../../data/delivery.seed'
import { SERVICE_LINES, ALL_ACCOUNTS, accountById, serviceLineLabel } from '../../data/shared'

export default function ProjectsPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [search, setSearch] = useState('')
  const [account, setAccount] = useState('All')
  const [sl, setSl] = useState('All')
  const [owner, setOwner] = useState('All')
  const [health, setHealth] = useState<string>(params.get('health') ?? 'All')
  const [family, setFamily] = useState<string>(params.get('family') ?? 'All')

  const owners = Array.from(new Set(ENGAGEMENTS.map(e => e.delivery_lead)))

  const filtered = ENGAGEMENTS.filter(e => {
    const q = search.trim().toLowerCase()
    if (q && !e.name.toLowerCase().includes(q)) return false
    if (account !== 'All' && e.account_id !== account) return false
    if (sl !== 'All' && e.service_line !== sl) return false
    if (owner !== 'All' && e.delivery_lead !== owner) return false
    if (health !== 'All' && ragOf(e.rag_status) !== health) return false
    if (family !== 'All' && !e.signals.some(s => s.family === family)) return false
    return true
  })

  const grouped = ALL_ACCOUNTS
    .map(a => ({ account: a, items: filtered.filter(e => e.account_id === a.id) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="dh">
      <Head />
      <DeliveryTabs />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field-row">
          <div className="field"><label>Search</label><input className="input" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} /></div>
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
          <div className="field"><label>Health status</label>
            <select className="select" value={health} onChange={e => setHealth(e.target.value)}>
              <option value="All">All</option>
              <option value="red">Critical</option>
              <option value="amber">Needs attention</option>
              <option value="green">Stable</option>
            </select>
          </div>
          <div className="field"><label>Signal family</label>
            <select className="select" value={family} onChange={e => setFamily(e.target.value)}>
              <option value="All">All</option>
              {ALL_SIGNAL_FAMILIES.map(f => <option key={f} value={f}>{SIGNAL_FAMILY_LABEL[f]}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setAccount('All'); setSl('All'); setOwner('All'); setHealth('All'); setFamily('All') }}>Clear filters</button>
          <span className="t-secondary" style={{ marginLeft: 10 }}>{filtered.length} of {ENGAGEMENTS.length} projects</span>
        </div>
      </div>

      {grouped.length ? grouped.map(g => {
        const red = g.items.filter(e => ragOf(e.rag_status) === 'red').length
        const amber = g.items.filter(e => ragOf(e.rag_status) === 'amber').length
        const green = g.items.filter(e => ragOf(e.rag_status) === 'green').length
        return (
          <div key={g.account.id} className="section-block">
            <div className="section-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: g.account.accent_color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{g.account.logo_letter}</div>
                <h2 className="t-card" style={{ fontSize: 18 }}>{g.account.name}</h2>
              </div>
              <div className="group-chip">
                {red > 0 && <span><span className="rag-dot rag-red" /> {red} critical</span>}
                {amber > 0 && <span><span className="rag-dot rag-amber" /> {amber} attention</span>}
                {green > 0 && <span><span className="rag-dot rag-green" /> {green} stable</span>}
              </div>
            </div>
            <div className="grid grid-3">
              {g.items.map(e => {
                const rag = ragOf(e.rag_status)
                return (
                  <div key={e.id} className="project-card" onClick={() => nav(`/delivery-health/engagement/${e.id}`)}>
                    <div className="project-card-top">
                      <span className="pill pill-navy">{g.account.name}</span>
                      <DhRagBadge rag={rag} />
                    </div>
                    <h4>{e.name}</h4>
                    <div className="t-secondary">{serviceLineLabel(e.service_line)} · Owner: {e.delivery_lead}</div>
                    <div className="divider" style={{ margin: '12px 0 10px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="t-caption">{e.signals.length} signal{e.signals.length === 1 ? '' : 's'} tracked</span>
                      <span style={{ color: 'var(--dh-link)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>View evidence <ArrowRight size={13} /></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }) : <p className="t-secondary">No projects match these filters.</p>}
    </div>
  )
}

function Head() {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="t-secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dh-gold-text)' }}>Delivery Health Module</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: '4px 0 6px', color: 'var(--dh-text)' }}>Projects</h1>
        <RagLogicInfo />
      </div>
      <p className="t-secondary" style={{ maxWidth: 760 }}>Every tracked engagement with its auto-computed health status. Filter by account, service line, owner, health or signal family; open any project for its evidence pack.</p>
    </div>
  )
}
