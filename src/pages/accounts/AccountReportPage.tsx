import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, TrendingUp, CheckCircle2, BarChart3, Target } from 'lucide-react'
import { ACCOUNT_INFO, ACCOUNTS_LIST } from '../../data/growthIndex'
import { accountById } from '../../data/shared'
import { metricsForAccount, INTELLIGENCE_CARDS, COMPETITOR_NAMES } from '../../data/marketing.seed'
import { STRATEGIC_HYPOTHESES, COMPETITORS } from '../../data/competition.seed'
import { engagementsForAccount, ragOf, ragLabel } from '../../data/delivery.seed'
import { crossModuleFor } from '../../lib/crossModule'
import './accountReport.css'

// ── small building blocks ─────────────────────────────────────────────────────
function SHead({ label, tag }: { label: string; tag?: string }) {
  return (
    <div className="arep-shead">
      <span className="dot" /><h3>{label}</h3><span className="rule" />
      {tag && <span className="tag">{tag}</span>}
    </div>
  )
}
function ModuleBanner({ n, title, onGo, id }: { n: string; title: string; onGo?: () => void; id?: string }) {
  return (
    <div className="arep-module-banner" id={id}>
      <span className="n">{n}</span><span className="t">{title}</span>
      {onGo && <button className="arep-gotomod" onClick={onGo}>Go to Module <ArrowRight size={14} /></button>}
    </div>
  )
}
function Dots({ n }: { n: number }) {
  return <span className="arep-dots">{[0, 1, 2, 3, 4].map(i => <i key={i} className={i < n ? 'on' : ''} />)}</span>
}
function level(s = '') {
  if (/urgent|most|highest|primary|immediate|critical/i.test(s)) return { n: 5, c: 'high', t: 'High' }
  if (/high|differentiated|near-term|active/i.test(s)) return { n: 4, c: 'high', t: 'High' }
  if (/medium|easiest|durable|follow|research gap/i.test(s)) return { n: 3, c: 'medium', t: 'Medium' }
  return { n: 2, c: 'low', t: 'Low' }
}
const clamp = (s: string, n: number) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '')

export default function AccountReportPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const acc = accountById(id)
  const info: any = ACCOUNT_INFO[id] || {}
  const listItem: any = ACCOUNTS_LIST.find((a: any) => a.id === id) || {}
  const x = crossModuleFor(id)

  if (!acc) {
    return (
      <div style={{ padding: 40 }}>
        <button className="btn btn-navy" onClick={() => nav('/accounts')}><ArrowLeft size={14} /> Back to Accounts</button>
        <p style={{ marginTop: 16 }}>Account not found.</p>
      </div>
    )
  }

  const org: any[] = info.orgLeadership || []
  const inits: any[] = info.strategicPriorities || []
  const adv: any[] = info.rightToWin?.advantages || []
  const grid: any[] = info.rightToWin?.competitiveGrid || []
  const core: any[] = info.playAreas?.coreServices || []
  const tech: any[] = info.playAreas?.technologyTrack || []
  const nba: any[] = info.nextBestAction || []
  const fin: any[] = info.financialSnapshot || []
  const priorities: string[] = info.emergingPriorities || []
  const pressures: string[] = String(listItem.pressureVectors || '').split(/\.\s+/).map((s: string) => s.trim().replace(/\.$/, '')).filter(Boolean)
  const invest: string = listItem.investmentDirection || info.investmentStrategy || ''

  const rev: any = listItem.revenues || {}
  const engs = engagementsForAccount(id)
  const mkt = metricsForAccount(id) || []
  const hyps = STRATEGIC_HYPOTHESES.filter((h: any) => h.account_ids?.includes(id))
  const topCards = INTELLIGENCE_CARDS.slice(0, 4)

  // Account Summary — 1-2 headline points pulled from each module (same sources as
  // the detailed sections below, so the summary and module views stay aligned).
  const summary = [
    { icon: <TrendingUp size={15} />, label: 'Sales & Growth', points: [
      `${info.posture?.label || acc.posture_label} · 3-year target ${rev.target3yr ?? acc.three_year_target ?? 'N/A'}`,
      inits[0]?.title ? `Top priority: ${inits[0].title}` : (invest ? clamp(invest, 90) : ''),
    ].filter(Boolean) },
    { icon: <BarChart3 size={15} />, label: 'Marketing & Service Line', points: [
      x.shareOfVoice != null ? `Share of voice ${x.shareOfVoice}%${x.topServiceLine ? ` · lead line ${x.topServiceLine}` : ''}` : 'Market metrics being compiled',
      mkt[0] ? `#${mkt[0].visibility_position} visibility · ${mkt[0].total_mentions} mentions (${mkt[0].time_window})` : '',
    ].filter(Boolean) },
    { icon: <CheckCircle2 size={15} />, label: 'Delivery Health', points: [
      `${ragLabel(ragOf(x.deliveryRag))} overall · ${engs.length} engagement${engs.length === 1 ? '' : 's'} tracked`,
      `${x.deliveryCounts.Critical} critical · ${x.deliveryCounts.NeedsAttention} need attention`,
    ] },
    { icon: <Target size={15} />, label: 'Competition', points: [
      `${x.openCompetitionSignals} open signal${x.openCompetitionSignals === 1 ? '' : 's'} (90d) · ${COMPETITORS.length} competitors tracked`,
      hyps[0]?.title ? `Watch: ${hyps[0].title}` : '',
    ].filter(Boolean) },
  ]

  return (
    <div className="arep">
      {/* Sticky bar with always-available back */}
      <div className="arep-bar">
        <button className="arep-back" onClick={() => nav('/overview')}>
          <ArrowLeft size={15} /> Back to Account
        </button>
        <div className="arep-jump">
          <a onClick={() => document.getElementById('sg')?.scrollIntoView({ behavior: 'smooth' })}>Sales &amp; Growth</a>
          <a onClick={() => document.getElementById('marketing')?.scrollIntoView({ behavior: 'smooth' })}>Marketing</a>
          <a onClick={() => document.getElementById('delivery')?.scrollIntoView({ behavior: 'smooth' })}>Delivery</a>
          <a onClick={() => document.getElementById('competition')?.scrollIntoView({ behavior: 'smooth' })}>Competition</a>
        </div>
      </div>

      <div className="arep-body">
        {/* Hero — account name, then straight into the summary */}
        <div className="arep-hero">
          <div className="arep-title">{acc.name}</div>
        </div>

        {/* Account Summary — cross-module headline before the module deep-dives */}
        <SHead label="Account Summary" tag="Cross-module snapshot" />
        <div className="arep-grid arep-g4">
          {summary.map((s, i) => (
            <div className="arep-card" key={i}>
              <div className="arep-col-title"><span className="ci">{s.icon}</span>{s.label}</div>
              <ul className="arep-list">{s.points.map((p: string, j: number) => <li key={j}>{p}</li>)}</ul>
            </div>
          ))}
        </div>

        {/* ══════════════ MODULE 1 — SALES & GROWTH ══════════════ */}
        <ModuleBanner n="01" title="Sales & Growth Intelligence" onGo={() => nav('/executive-summary')} id="sg" />

        <div className="arep-grid arep-g2">
          {/* Company overview */}
          <div className="arep-card">
            <SHead label="Company Overview" />
            {info.accountContext && <p className="arep-p" style={{ marginBottom: 12 }}>{clamp(String(info.accountContext), 420)}</p>}
            <div className="arep-facts">
              <div className="arep-fact"><span className="fl">Posture</span><span className="fv">{info.posture?.label || acc.posture_label}</span></div>
              <div className="arep-fact"><span className="fl">Executives mapped</span><span className="fv">{listItem.executivesMapped ?? '—'}</span></div>
              <div className="arep-fact"><span className="fl">Portfolio head</span><span className="fv">{acc.portfolio_head ?? listItem.portfolioHead ?? 'N/A'}</span></div>
              <div className="arep-fact"><span className="fl">Account owner</span><span className="fv">{acc.account_owner ?? listItem.accountOwner ?? 'N/A'}</span></div>
            </div>
          </div>
          {/* Financial snapshot */}
          <div className="arep-card">
            <SHead label="Financial Snapshot" />
            <div className="arep-grid arep-g2">
              {fin.slice(0, 8).map((f: any, i: number) => (
                <div className="arep-metric" key={i}>
                  <div className="ml">{f.label}</div>
                  <div className="mv" style={{ color: 'var(--arep-navy)' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic context — three separate, spaced cards */}
        <SHead label="Strategic Context" />
        <div className="arep-grid arep-g3">
          <div className="arep-card">
            <div className="arep-col-title"><span className="ci"><TrendingUp size={14} /></span>Investment Direction</div>
            <p className="arep-p" style={{ fontSize: 13 }}>{clamp(invest, 340) || '—'}</p>
          </div>
          <div className="arep-card">
            <div className="arep-col-title">Emerging Priorities</div>
            <ul className="arep-list">{(priorities.length ? priorities : ['No priorities recorded']).slice(0, 5).map((p, i) => <li key={i}>{clamp(p, 120)}</li>)}</ul>
          </div>
          <div className="arep-card">
            <div className="arep-col-title">Pressure Vectors</div>
            <ul className="arep-list muted">{(pressures.length ? pressures : ['No pressures recorded']).slice(0, 5).map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        </div>

        {/* Industry + Leadership */}
        <div className="arep-grid arep-g2">
          <div className="arep-card">
            <SHead label="Industry Trends & Pressures" />
            <ul className="arep-list">{[...priorities, ...pressures].slice(0, 6).map((p, i) => <li key={i}>{clamp(p, 130)}</li>)}</ul>
          </div>
          <div className="arep-card">
            <SHead label="Leadership & Organization" />
            <div className="arep-grid arep-g2">
              {org.slice(0, 4).map((o: any, i: number) => (
                <div className="arep-org" key={i}>
                  <div className="r">{o.role}</div>
                  <div className="n">{o.name}</div>
                  <div className="i">{clamp(o.insight, 130)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key initiatives */}
        {inits.length > 0 && (<>
          <SHead label="Key Initiatives to Watch" tag={`${inits.length} tracked`} />
          <div className="arep-grid arep-g4">
            {inits.slice(0, 8).map((it: any, i: number) => (
              <div className="arep-init" key={i}>
                <div className="k">{it.priority}</div>
                <div className="h">{it.title}</div>
                <div className="b">{clamp(it.body, 150)}</div>
              </div>
            ))}
          </div>
        </>)}

        {/* Sales intelligence */}
        {adv.length > 0 && (<>
          <SHead label="Sales Intelligence — Right to Win" />
          <div className="arep-grid arep-g2">
            {adv.map((a: any, i: number) => (
              <div className="arep-card" key={i}>
                <div className="arep-col-title">{a.title}</div>
                <p className="arep-p" style={{ fontSize: 12.5, color: 'var(--arep-muted)' }}>{clamp(a.body, 260)}</p>
              </div>
            ))}
          </div>
        </>)}

        {/* Technology landscape + Opportunity areas */}
        {(tech.length > 0 || core.length > 0) && (
          <div className="arep-grid arep-g2">
            <div className="arep-card">
              <SHead label="Technology Landscape" />
              <div className="arep-chips">
                {tech.map((t: any, i: number) => <span className="arep-chip soft" key={i}>{t.platform}</span>)}
                {tech.length === 0 && <span className="arep-note">No technology track mapped.</span>}
              </div>
            </div>
            <div className="arep-card">
              <SHead label="Opportunity Areas" />
              {core.map((c: any, i: number) => {
                const lv = level(c.priority)
                return (
                  <div className="arep-meter-row" key={i}>
                    <span className="lab">{c.service}</span>
                    <span className="arep-meter"><Dots n={lv.n} /><span className={`arep-level ${lv.c}`}>{lv.t}</span></span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Next Best Action */}
        {core.length > 0 && (<>
          <SHead label="Next Best Action" />
          <div className="arep-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="arep-table">
              <thead><tr><th>Priority</th><th>Best-Fit Offering</th><th>Business Impact</th><th>Revenue</th><th style={{ textAlign: 'right' }}>Fit</th></tr></thead>
              <tbody>
                {core.map((c: any, i: number) => {
                  const lv = level(c.priority)
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ fontWeight: 700 }}>{c.service}</td>
                      <td style={{ color: 'var(--arep-muted)' }}>{clamp(c.opportunity, 160)}</td>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 700, color: 'var(--arep-green)' }}>{c.revenue}</td>
                      <td style={{ textAlign: 'right' }}><Dots n={lv.n} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>)}

        {/* Discovery guidance */}
        {nba.length > 0 && (<>
          <SHead label="Discovery Guidance — Next Best Actions" />
          <div className="arep-grid arep-g2">
            {nba.slice(0, 6).map((n: any, i: number) => (
              <div className="arep-card" key={i} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                  <span className="arep-chip soft">{n.priority}</span>
                  {n.urgency && <span className="arep-note" style={{ fontStyle: 'normal' }}>{n.urgency}</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{n.action}</div>
                <p className="arep-p" style={{ fontSize: 12, color: 'var(--arep-muted)' }}>{clamp(n.detail, 200)}</p>
                {n.owner && <div className="arep-note" style={{ marginTop: 6 }}>Owner: {n.owner}</div>}
              </div>
            ))}
          </div>
        </>)}

        {/* At a glance */}
        {fin.length > 0 && (<>
          <SHead label="At a Glance" />
          <div className="arep-grid arep-g5">
            {fin.slice(0, 5).map((f: any, i: number) => (
              <div className="arep-metric" key={i}><div className="ml">{f.label}</div><div className="mv" style={{ fontSize: 17 }}>{f.value}</div></div>
            ))}
          </div>
        </>)}

        {/* Why this account */}
        {adv.length > 0 && (<>
          <SHead label={`Why ${acc.name}?`} />
          <div className="arep-card">
            {adv.map((a: any, i: number) => (
              <div className="arep-check" key={i}><Check size={16} className="ck" /><span><b>{a.title}.</b> {clamp(a.body, 160)}</span></div>
            ))}
          </div>
        </>)}

        {/* ══════════════ MODULE 2 — MARKETING & SERVICE LINE ══════════════ */}
        <ModuleBanner n="02" title="Marketing & Service Line" onGo={() => nav('/marketing')} id="marketing" />
        <div className="arep-grid arep-g4" style={{ marginBottom: 14 }}>
          <div className="arep-metric"><div className="ml">Share of Voice</div><div className="mv" style={{ color: 'var(--arep-blue)' }}>{x.shareOfVoice != null ? `${x.shareOfVoice}%` : '—'}</div></div>
          <div className="arep-metric"><div className="ml">Top Service Line</div><div className="mv" style={{ fontSize: 16 }}>{x.topServiceLine || '—'}</div></div>
          <div className="arep-metric"><div className="ml">Service Lines Tracked</div><div className="mv">{mkt.length || '—'}</div></div>
          <div className="arep-metric"><div className="ml">Active Competitors</div><div className="mv">{mkt[0]?.competitors_active ?? '—'}</div></div>
        </div>
        {mkt.length > 0 && (<>
          <SHead label="Service-Line Visibility" />
          <div className="arep-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="arep-table">
              <thead><tr><th>Service Line</th><th>Visibility</th><th>Mentions</th><th>Competitors</th><th>Share of Voice</th><th>Window</th></tr></thead>
              <tbody>
                {mkt.map((m: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{m.service_line}</td>
                    <td>#{m.visibility_position}</td>
                    <td>{m.total_mentions}</td>
                    <td>{m.competitors_active}</td>
                    <td style={{ fontWeight: 700, color: 'var(--arep-blue)' }}>{m.share_of_voice_pct}%</td>
                    <td style={{ color: 'var(--arep-muted)' }}>{m.time_window}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <SHead label="Active Competitor Signals" />
        <div className="arep-card">
          <div className="arep-chips" style={{ marginBottom: 12 }}>{COMPETITOR_NAMES.slice(0, 12).map((c: string, i: number) => <span className="arep-chip" key={i}>{c}</span>)}</div>
          <ul className="arep-list">{topCards.map((c: any) => <li key={c.id}><b>{c.competitor}:</b> {clamp(c.headline || c.title || c.tags?.join(', ') || '', 140)}</li>)}</ul>
        </div>

        {/* ══════════════ MODULE 3 — DELIVERY HEALTH ══════════════ */}
        <ModuleBanner n="03" title="Delivery Health" onGo={() => nav('/delivery-health')} id="delivery" />
        <div className="arep-grid arep-g4" style={{ marginBottom: 14 }}>
          <div className="arep-metric"><div className="ml">Overall Health</div><div className="mv" style={{ color: ragOf(x.deliveryRag) === 'red' ? 'var(--arep-red)' : ragOf(x.deliveryRag) === 'amber' ? 'var(--arep-gold)' : 'var(--arep-green)' }}>{ragLabel(ragOf(x.deliveryRag))}</div></div>
          <div className="arep-metric"><div className="ml">Critical</div><div className="mv" style={{ color: 'var(--arep-red)' }}>{x.deliveryCounts.Critical}</div></div>
          <div className="arep-metric"><div className="ml">Needs Attention</div><div className="mv" style={{ color: 'var(--arep-gold)' }}>{x.deliveryCounts.NeedsAttention}</div></div>
          <div className="arep-metric"><div className="ml">Stable</div><div className="mv" style={{ color: 'var(--arep-green)' }}>{x.deliveryCounts.Stable}</div></div>
        </div>
        <SHead label="Tracked Engagements" tag={`${engs.length} total`} />
        {engs.length === 0 ? <div className="arep-card"><span className="arep-note">No tracked engagements for this account.</span></div> : (
          <div className="arep-grid arep-g2">
            {engs.map((e: any) => {
              const r = ragOf(e.rag_status)
              const ivs = (e.interventions || []).slice(0, 2)
              return (
                <div className="arep-card" key={e.id}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.35 }}>{e.name}</div>
                    <span className={`arep-rag ${r}`} style={{ flexShrink: 0 }}>{ragLabel(r)}</span>
                  </div>
                  <p className="arep-p" style={{ fontSize: 12, color: 'var(--arep-muted)', marginBottom: ivs.length ? 10 : 0 }}>{clamp(e.root_cause, 240)}</p>
                  {ivs.length > 0 && <ul className="arep-list">{ivs.map((iv: any) => <li key={iv.id}>{clamp(iv.title, 110)}</li>)}</ul>}
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════ MODULE 4 — COMPETITION ══════════════ */}
        <ModuleBanner n="04" title="Competition" onGo={() => nav('/competition')} id="competition" />
        <div className="arep-grid arep-g3" style={{ marginBottom: 14 }}>
          <div className="arep-metric"><div className="ml">Open Signals (90d)</div><div className="mv" style={{ color: 'var(--arep-red)' }}>{x.openCompetitionSignals}</div></div>
          <div className="arep-metric"><div className="ml">Tracked Competitors</div><div className="mv">{COMPETITORS.length}</div></div>
          <div className="arep-metric"><div className="ml">Strategic Hypotheses</div><div className="mv">{hyps.length}</div></div>
        </div>
        {hyps.length > 0 && (<>
          <SHead label="Strategic Hypotheses for This Account" />
          <div className="arep-grid arep-g2">
            {hyps.map((h: any) => {
              const comp = COMPETITORS.find((c: any) => c.id === h.competitor_id)
              return (
                <div className="arep-card" key={h.id}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span className="arep-chip soft">{comp?.name || 'Competitor'}</span>
                    <span className="arep-note" style={{ fontStyle: 'normal' }}>{h.confidence} confidence</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 5 }}>{h.title}</div>
                  <p className="arep-p" style={{ fontSize: 12, color: 'var(--arep-muted)' }}>{clamp(h.hypothesis, 220)}</p>
                </div>
              )
            })}
          </div>
        </>)}
        {grid.length > 0 && (<>
          <SHead label="Competitive Coverage Grid" />
          <div className="arep-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="arep-table">
              <thead><tr><th>Capability Area</th><th>Company</th><th>ICON / Parexel</th><th>Veeva</th><th>Other</th></tr></thead>
              <tbody>
                {grid.map((g: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{g.area}</td>
                    <td>{g.freyr}</td><td>{g.iconParexel}</td><td>{g.veeva}</td><td>{g.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="arep-note" style={{ marginTop: 8 }}>* Presence inferred from typical large-pharma vendor patterns; not a confirmed named contract.</div>
        </>)}

        <div style={{ display: 'flex', gap: 10, marginTop: 30, alignItems: 'center' }}>
          <button className="arep-back" onClick={() => nav('/overview')}><ArrowLeft size={15} /> Back to Account</button>
          <span className="arep-note">Cross-module account research report · generated from connected module data.</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 10, color: 'var(--arep-faint)' }}>
            <TrendingUp size={16} /><CheckCircle2 size={16} /><BarChart3 size={16} /><Target size={16} />
          </span>
        </div>
      </div>
    </div>
  )
}
