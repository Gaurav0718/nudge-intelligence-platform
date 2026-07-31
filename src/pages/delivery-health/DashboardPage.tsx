import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './deliveryTheme.css'
import { DeliveryTabs, FAMILY_SHORT } from './deliveryUi'
import { ENGAGEMENTS, ragOf, ALL_SIGNAL_FAMILIES, type Rag, type SignalFamily } from '../../data/delivery.seed'
import { SERVICE_LINES, ALL_ACCOUNTS, serviceLineLabel } from '../../data/shared'
import { accountHealthStats, familyHealthData, allIvRows, matrixMatch } from './deliveryData'

// Monochrome navy ramp (dark → light). Critical=darkest, Stable=lightest.
const AZ = { critical: '#1B365D', attention: '#4a72b0', stable: '#a9c2e6', info: '#0f1e36' }
// Matrix heat = navy gradient (navy-faint → navy).
const HEAT_LIGHT = [238, 242, 248]  // #eef2f8 navy-faint
const HEAT_DARK = [27, 54, 93]      // #1B365D navy

export default function DashboardPage() {
  const nav = useNavigate()
  const [mxHealth, setMxHealth] = useState<Rag | 'all'>('red')
  const [mxAccount, setMxAccount] = useState<string>('All')

  const critical = ENGAGEMENTS.filter(e => ragOf(e.rag_status) === 'red').length
  const attention = ENGAGEMENTS.filter(e => ragOf(e.rag_status) === 'amber').length
  const stable = ENGAGEMENTS.filter(e => ragOf(e.rag_status) === 'green').length
  const total = ENGAGEMENTS.length

  const ivRows = allIvRows()
  const ivCounts = {
    awaiting: ivRows.filter(r => r.status === 'awaiting').length,
    accepted: ivRows.filter(r => r.status === 'accepted').length,
    completed: ivRows.filter(r => r.status === 'completed').length,
    rejected: ivRows.filter(r => r.status === 'rejected').length,
  }
  const ivTotal = ivRows.length

  const famData = familyHealthData()
  const acctStats = accountHealthStats()
  const best = acctStats.reduce((b, d) => (!b || d.score > b.score ? d : b), acctStats[0])
  const worst = acctStats.reduce((w, d) => (!w || d.score < w.score ? d : w), acctStats[0])
  const problematic = acctStats.filter(d => d.red > 0 || d.amber > 0).sort((a, b) => (b.red - a.red) || (b.amber - a.amber)).slice(0, 5)

  // Matrix
  const mxProjects = ENGAGEMENTS.filter(e => mxAccount === 'All' || e.account_id === mxAccount)
  const mxRows = SERVICE_LINES.map(sl => {
    const slp = mxProjects.filter(e => e.service_line === sl.id)
    if (!slp.length) return null
    const cells = ALL_SIGNAL_FAMILIES.map(fam => slp.filter(e => matrixMatch(e, fam, mxHealth)).length)
    return { sl: sl.label, cells, rowTotal: cells.reduce((a, b) => a + b, 0) }
  }).filter(Boolean) as { sl: string; cells: number[]; rowTotal: number }[]
  const mxMax = Math.max(1, ...mxRows.flatMap(r => r.cells))
  const mxColTotals = ALL_SIGNAL_FAMILIES.map((_, i) => mxRows.reduce((s, r) => s + r.cells[i], 0))

  const attentionList = ivRows.filter(r => r.status === 'awaiting')
    .sort((a, b) => a.iv.due_date.localeCompare(b.iv.due_date)).slice(0, 5)

  return (
    <div className="dh">
      <SectionHead title="Delivery Health" sub="Auto-computed from categorized signal families across all engagements. Each engagement carries a 3-cycle trend, per-dimension business impact, a dated timeline, and recommended recovery interventions." />
      <DeliveryTabs />

      {/* Hero row */}
      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-head"><div><h2 className="t-section" style={{ fontSize: 16 }}>Delivery health metrics</h2><p className="t-secondary">All {total} projects.</p></div></div>
          <div className="card hero-card" style={{ ['--accent-color' as any]: AZ.info, flex: 1, display: 'flex', alignItems: 'center' }}>
            <div className="metric-blocks" style={{ width: '100%' }}>
              <MetricBlock value={critical} label="Critical" color={AZ.critical} total={total} onClick={() => nav('/delivery-health/projects?health=red')} />
              <MetricBlock value={attention} label="Needs attention" color={AZ.attention} total={total} onClick={() => nav('/delivery-health/projects?health=amber')} />
              <MetricBlock value={stable} label="Stable" color={AZ.stable} total={total} onClick={() => nav('/delivery-health/projects?health=green')} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-head"><div><h2 className="t-section" style={{ fontSize: 16 }}>Intervention pipeline</h2><p className="t-secondary">All {ivTotal} recommendations.</p></div></div>
          <div className="card hero-card" style={{ ['--accent-color' as any]: AZ.info, flex: 1 }}>
            <div className="donut-wrap">
              <Donut segments={[
                { value: ivCounts.awaiting, color: AZ.attention },
                { value: ivCounts.accepted, color: AZ.info },
                { value: ivCounts.completed, color: AZ.stable },
                { value: ivCounts.rejected, color: AZ.critical },
              ]} />
              <div className="donut-legend" style={{ marginTop: 0 }}>
                <LegendItem label="Awaiting review" value={ivCounts.awaiting} total={ivTotal} color={AZ.attention} onClick={() => nav('/delivery-health/actions')} />
                <LegendItem label="Accepted / in progress" value={ivCounts.accepted} total={ivTotal} color={AZ.info} onClick={() => nav('/delivery-health/actions')} />
                <LegendItem label="Completed" value={ivCounts.completed} total={ivTotal} color={AZ.stable} onClick={() => nav('/delivery-health/actions')} />
                <LegendItem label="Rejected" value={ivCounts.rejected} total={ivTotal} color={AZ.critical} onClick={() => nav('/delivery-health/actions')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health by Signal Family */}
      <div className="section-block">
        <div className="section-head"><div><h2 className="t-section">Health by Signal Family</h2><p className="t-secondary">Delivery risks are grouped by signal family to show whether exposure is concentrated in performance, compliance, sentiment, operations, or people-related areas. Hover a bar for the breakdown; click to see its projects.</p></div></div>
        <FamilyBarChart data={famData} onPick={f => nav(`/delivery-health/projects?family=${f}`)} />
      </div>

      {/* Risk concentration matrix */}
      <div className="section-block">
        <div className="section-head"><div><h2 className="t-section">Risk concentration matrix</h2><p className="t-secondary">Service line × signal family — number of projects with a {mxHealth === 'all' ? 'at-risk' : mxHealth === 'red' ? 'critical' : mxHealth === 'amber' ? 'needs-attention' : 'stable'} signal at each intersection. Darker cells mean more concentrated risk.</p></div></div>
        <div className="card matrix-scroll">
          <div className="field-row">
            <div className="field"><label>Health metric</label>
              <select className="select" value={mxHealth} onChange={e => setMxHealth(e.target.value as any)}>
                <option value="red">Critical</option>
                <option value="amber">Needs attention</option>
                <option value="green">Stable</option>
                <option value="all">At-risk (critical + needs attention)</option>
              </select>
            </div>
            <div className="field"><label>Account</label>
              <select className="select" value={mxAccount} onChange={e => setMxAccount(e.target.value)}>
                <option>All</option>
                {ALL_ACCOUNTS.filter(a => a.is_core_demo_account).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ margin: '12px 0 4px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setMxHealth('red'); setMxAccount('All') }}>Clear filters</button>
            <span className="t-secondary" style={{ marginLeft: 10 }}>{mxProjects.length} project{mxProjects.length === 1 ? '' : 's'} in view</span>
          </div>
          {mxRows.length ? (
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Service line</th>
                  {ALL_SIGNAL_FAMILIES.map(f => <th key={f}>{FAMILY_SHORT[f]}</th>)}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {mxRows.map(r => (
                  <tr key={r.sl}>
                    <td className="matrix-row-label">{r.sl}</td>
                    {r.cells.map((v, i) => <td key={i} style={{ padding: 0 }}>{matrixCell(v, mxMax)}</td>)}
                    <td className="matrix-total">{r.rowTotal}</td>
                  </tr>
                ))}
                <tr>
                  <td className="matrix-row-total-label">Total</td>
                  {mxColTotals.map((c, i) => <td key={i} className="matrix-total">{c}</td>)}
                  <td className="matrix-total">{mxColTotals.reduce((a, b) => a + b, 0)}</td>
                </tr>
              </tbody>
            </table>
          ) : <p className="t-secondary" style={{ padding: '8px 2px' }}>No projects match these filters.</p>}
        </div>
      </div>

      {/* Health by account */}
      <div className="section-block">
        <div className="section-head"><div><h2 className="t-section">Health by account</h2><p className="t-secondary">Best and worst performing accounts by health score. Click a card to see its projects.</p></div></div>
        <div className="grid grid-2">
          <AccountSummary d={best} label="Best performing" labelColor={AZ.attention} onClick={() => nav(`/delivery-health/accounts?account=${best.account_id}`)} />
          <AccountSummary d={worst} label="Worst performing" labelColor={AZ.info} onClick={() => nav(`/delivery-health/accounts?account=${worst.account_id}`)} />
        </div>
      </div>

      {/* Top problematic + Needs attention */}
      <div className="section-block">
        <div className="section-head"><div><h2 className="t-section">Top problematic accounts</h2><p className="t-secondary">Ranked by critical, then at-risk, signal volume.</p></div></div>
        <div className="card">
          {problematic.map((d, i) => (
            <div key={d.account_id} className="attn-item" style={{ cursor: 'pointer' }} onClick={() => nav(`/delivery-health/accounts?account=${d.account_id}`)}>
              <span className="t-label-upper" style={{ width: 22, flexShrink: 0 }}>#{i + 1}</span>
              <div className="attn-body">
                <div className="attn-title">{d.account}</div>
                <div className="attn-sub">{d.total} project{d.total === 1 ? '' : 's'} tracked</div>
              </div>
              {d.red > 0 && <span className="badge badge-red">{d.red} critical</span>}
              {d.amber > 0 && <span className="badge badge-amber">{d.amber} attention</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="section-block">
        <div className="section-head"><div><h2 className="t-section">Needs your attention</h2><p className="t-secondary">The most time-sensitive recommendations, ordered by due date.</p></div></div>
        <div className="card">
          {attentionList.length ? attentionList.map(r => (
            <div key={r.iv.id} className="attn-item">
              <div className="attn-body">
                <div className="attn-title">{r.iv.title}</div>
                <div className="attn-sub">
                  <button onClick={() => nav(`/delivery-health/engagement/${r.engagement.id}`)} style={{ color: 'var(--dh-link)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{r.engagement.name}</button>
                  {' · '}{accountName(r.engagement.account_id)}{' · '}
                  <span className={isOverdue(r.iv.due_date) ? 'overdue' : ''}>{isOverdue(r.iv.due_date) ? 'Overdue since ' : 'Due '}{r.iv.due_date}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => nav('/delivery-health/actions')}>Review</button>
            </div>
          )) : <p className="t-secondary">Nothing urgent right now — nice work.</p>}
        </div>
      </div>
    </div>
  )
}

// ─── local components ─────────────────────────────────────────────────────────
function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="t-secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dh-gold-text)' }}>Delivery Health Module</div>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: '4px 0 6px', color: 'var(--dh-text)' }}>{title}</h1>
      <p className="t-secondary" style={{ maxWidth: 760 }}>{sub}</p>
    </div>
  )
}

function MetricBlock({ value, label, color, total, onClick }: { value: number; label: string; color: string; total: number; onClick: () => void }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  const c = color.replace('#', ''); const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16)
  const txt = (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.6 ? '#20180A' : '#fff'
  return (
    <button className="metric-block" style={{ background: color, color: txt }} onClick={onClick}>
      <div className="metric-block-value">{value}</div>
      <div className="metric-block-label">{label}</div>
      <div className="metric-block-pct">{pct}%</div>
    </button>
  )
}

function Donut({ segments }: { segments: { value: number; color: string }[] }) {
  const size = 150, thickness = 22
  const r = (size - thickness) / 2, cx = size / 2, cy = size / 2
  const circ = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0)
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {total === 0 && <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={thickness} stroke="var(--dh-border)" />}
      {segments.filter(s => s.value > 0).map((seg, i) => {
        const dash = (seg.value / total) * circ
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" strokeWidth={thickness}
          strokeDasharray={`${dash.toFixed(2)} ${(circ - dash).toFixed(2)}`} strokeDashoffset={(-offset).toFixed(2)}
          transform={`rotate(-90 ${cx} ${cy})`} style={{ stroke: seg.color }} />
        offset += dash
        return el
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="700" fill="var(--dh-text)">{total}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="var(--dh-text-2)" letterSpacing="0.05em">TOTAL</text>
    </svg>
  )
}

function LegendItem({ label, value, total, color, onClick }: { label: string; value: number; total: number; color: string; onClick: () => void }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div className="donut-legend-item" onClick={onClick}>
      <span className="donut-legend-label"><span className="dot" style={{ background: color }} />{label}</span>
      <span className="donut-legend-value">{value} <span className="t-caption">({pct}%)</span></span>
    </div>
  )
}

function AccountSummary({ d, label, labelColor, onClick }: { d: { account: string; total: number; red: number; amber: number; green: number; score: number }; label: string; labelColor: string; onClick: () => void }) {
  return (
    <div className="sl-card" onClick={onClick}>
      <span className="small-caps" style={{ color: labelColor }}>{label}</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
        <span className="t-card" style={{ fontSize: 18 }}>{d.account}</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: labelColor }}>{d.score}%</span>
      </div>
      <div className="sl-bar">
        {d.red > 0 && <div style={{ width: `${d.red / d.total * 100}%`, background: AZ.info }} />}
        {d.amber > 0 && <div style={{ width: `${d.amber / d.total * 100}%`, background: AZ.attention }} />}
        {d.green > 0 && <div style={{ width: `${d.green / d.total * 100}%`, background: AZ.stable }} />}
      </div>
      <div className="sl-legend">
        <span><span style={{ width: 9, height: 9, borderRadius: '50%', display: 'inline-block', background: AZ.info }} />{d.red} critical</span>
        <span><span style={{ width: 9, height: 9, borderRadius: '50%', display: 'inline-block', background: AZ.attention }} />{d.amber} attention</span>
        <span><span style={{ width: 9, height: 9, borderRadius: '50%', display: 'inline-block', background: AZ.stable }} />{d.green} stable</span>
        <span style={{ marginLeft: 'auto' }}>{d.total} projects</span>
      </div>
    </div>
  )
}

function Leg({ color, label }: { color: string; label: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--dh-text-2)' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />{label}</span>
}

function FamilyBarChart({ data, onPick }: { data: { family: SignalFamily; total: number; critical: number; attention: number; stable: number }[]; onPick: (f: SignalFamily) => void }) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null)
  const max = Math.max(1, ...data.map(d => d.total))
  const H = 240
  const segsOf = (d: { critical: number; attention: number; stable: number }) => [
    { k: 'stable', label: 'Stable', color: AZ.stable, val: d.stable },
    { k: 'attention', label: 'Needs attention', color: AZ.attention, val: d.attention },
    { k: 'critical', label: 'Critical', color: AZ.critical, val: d.critical },
  ]
  return (
    <div className="card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', gap: 22, marginBottom: 16 }}>
        <Leg color={AZ.critical} label="Critical" />
        <Leg color={AZ.attention} label="Needs attention" />
        <Leg color={AZ.stable} label="Stable" />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: H + 46, borderTop: '1px solid var(--dh-border-soft)', paddingTop: 10 }}>
        {data.map(d => {
          const totalPx = Math.max(d.total > 0 ? 10 : 0, Math.round(d.total / max * H))
          return (
            <div key={d.family} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onClick={() => onPick(d.family)}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--dh-text)', marginBottom: 6 }}>{d.total}</div>
                <div style={{ width: '68%', maxWidth: 88, minWidth: 42, height: totalPx, display: 'flex', flexDirection: 'column', borderRadius: '8px 8px 0 0', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', transition: 'filter 150ms' }}>
                  {segsOf(d).map(s => s.val > 0 && (
                    <div key={s.k}
                      onMouseEnter={e => setTip({ x: e.clientX, y: e.clientY, text: `${s.label}: ${s.val} of ${d.total} (${Math.round(s.val / d.total * 100)}%)` })}
                      onMouseMove={e => setTip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                      onMouseLeave={() => setTip(null)}
                      style={{ height: `${s.val / d.total * 100}%`, minHeight: 6, background: s.color }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', color: 'var(--dh-text)' }}>{familyName(d.family)}</div>
            </div>
          )
        })}
      </div>
      {tip && (
        <div style={{ position: 'fixed', left: tip.x + 14, top: tip.y - 12, background: 'var(--dh-card, #fff)', border: '1px solid var(--dh-border)', borderRadius: 8, padding: '6px 11px', fontSize: 12.5, fontWeight: 600, color: 'var(--dh-text)', boxShadow: '0 8px 24px rgba(0,0,0,0.16)', pointerEvents: 'none', zIndex: 1000, whiteSpace: 'nowrap' }}>
          {tip.text}
        </div>
      )}
    </div>
  )
}

function matrixCell(val: number, max: number) {
  if (!val) return <div className="matrix-cell" style={{ background: 'var(--dh-surface)', color: 'var(--dh-text-3)' }}>–</div>
  const t = Math.min(1, val / max)
  const rgb = HEAT_LIGHT.map((c, i) => Math.round(c + (HEAT_DARK[i] - c) * t))
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
  return <div className="matrix-cell" style={{ background: `rgb(${rgb.join(',')})`, color: lum >= 0.5 ? '#20180A' : '#F3F4F6' }}>{val}</div>
}

function familyName(f: SignalFamily) { return { DeliveryPerformance: 'Delivery Performance', RiskCompliance: 'Risk & Compliance', CustomerSentiment: 'Customer Sentiment', OperationsData: 'Operations Data', PeopleData: 'People Data' }[f] }
function accountName(id: string) { return ALL_ACCOUNTS.find(a => a.id === id)?.name ?? id }
function isOverdue(due: string) { return new Date(due + 'T00:00:00') < new Date('2026-07-15T00:00:00') }
