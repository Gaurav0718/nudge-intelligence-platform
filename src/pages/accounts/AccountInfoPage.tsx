import { useState, useEffect, createContext, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, ArrowRight, ChevronDown, ChevronRight, ArrowLeft, Zap, CheckCircle2, Users } from 'lucide-react'
import { ACCOUNT_INFO, ACCOUNTS_LIST, NEWS_INTERNAL, NEWS_EXTERNAL_BY_ACCOUNT, Company_PROFILE } from '../../data/growthIndex'
import { COMPETITORS, SIGNALS as COMPETITOR_SIGNALS, STRATEGIC_HYPOTHESES, POSITIONING } from '../../data/competition.seed'

// Ported from the project's original AccountInfoPage.tsx (recovered from a
// pre-Company-rekey backup) onto the current 5-account data layer
// (growthIndex.ts). Two sections from the original — SalesIntel and
// CompetitiveIntel — were hardcoded battlecards specific to the old
// Revance/Takeda demo accounts with no real equivalent for AstraZeneca/GSK/
// J&J/Novartis/Sanofi, so they were dropped rather than faked; everything
// else renders real per-account fields from ACCOUNT_INFO/Company_PROFILE.

// ─── LAYERED NAV STRUCTURE ────────────────────────────────────────────────────
const NAV_LAYERS = [
  {
    id: 'account-layer', label: 'Account Layer', color: '#1B6BC0', icon: '📊', description: "What's happening?",
    items: [
      { id: 'nudge', label: 'Account Intelligence', icon: '⚡' },
      { id: 'news', label: 'News Intelligence', icon: '📰' },
      { id: 'one-min', label: 'One Minute Summary', icon: '⏱' },
      { id: 'financial', label: 'Financial Snapshot', icon: '💰' },
      { id: 'swot', label: 'SWOT Analysis', icon: '🔷' },
    ],
  },
  {
    id: 'business-layer', label: 'Business Layer', color: '#7C3AED', icon: '👥', description: 'Why is it happening?',
    items: [
      { id: 'org-leadership', label: 'Key Stakeholders', icon: '👤' },
      { id: 'strategic', label: 'Strategic Priorities', icon: '🎯' },
      { id: 'right-to-win', label: 'Right to Win', icon: '🏆' },
      { id: 'freyr-play', label: 'Company Opportunities', icon: '💡' },
    ],
  },
  {
    id: 'growth-layer', label: 'Growth Layer', color: '#059669', icon: '🎯', description: 'Where can we win?',
    items: [
      { id: 'revenue-target', label: 'Revenue Target', icon: '📈' },
      { id: 'pipeline', label: 'Pipeline Insights', icon: '🔬' },
      { id: 'play-areas', label: 'Play Areas', icon: '🗺' },
      { id: 'investment', label: 'Investment Strategy', icon: '💎' },
    ],
  },
  {
    id: 'execution-layer', label: 'Execution Layer', color: '#EA580C', icon: '⚡', description: 'What should we do?',
    items: [
      { id: 'next-action', label: 'Next Best Actions', icon: '🚀' },
      { id: '90day-plan', label: '90-Day Action Plan', icon: '📅' },
      { id: 'big-bets', label: 'Big Bets', icon: '🎲' },
    ],
  },
  {
    id: 'workspace-layer', label: 'Workspace', color: '#6B7280', icon: '📋', description: 'How will we stay aligned?',
    items: [{ id: 'notes', label: 'Notes & Download', icon: '📝' }],
  },
]

const Ctx = createContext<string>('nudge')

function Slide({ id, children }: { id: string; children: React.ReactNode }) {
  const a = useContext(Ctx)
  if (a !== id) return null
  return <section style={{ animation: 'pageIn 220ms ease both' }}>{children}</section>
}

// ─── HIGHLIGHTED SIGNAL CARD ─────────────────────────────────────────────────
function NudgeSignalCard({ text }: { text?: string }) {
  if (!text) return null
  return (
    <div style={{ background: 'linear-gradient(135deg,#1B365D 0%,#244878 100%)', border: '1px solid rgba(212,175,55,0.35)', borderLeft: '5px solid #D4AF37', borderRadius: 12, padding: '20px 24px', marginBottom: 18, boxShadow: '0 4px 20px rgba(27,54,93,0.3)' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <Zap size={20} style={{ color: '#D4AF37', flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(212,175,55,0.9)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Company INTELLIGENCE SIGNAL</div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.94)', lineHeight: 1.75, margin: 0 }}>{text}</p>
        </div>
      </div>
    </div>
  )
}

// ─── HIGHLIGHTED COMPANY IMPLICATION CARD ───────────────────────────────────
function CompanyCard({ text }: { text?: string }) {
  if (!text) return null
  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.14) 0%,rgba(212,175,55,0.06) 100%)', border: '1.5px solid rgba(212,175,55,0.45)', borderLeft: '5px solid #D4AF37', borderRadius: 12, padding: '18px 22px', marginBottom: 22, boxShadow: '0 2px 12px rgba(212,175,55,0.12)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#b89428', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>WHAT THIS MEANS FOR COMPANY</div>
      <p style={{ fontSize: 16, color: '#7a5c00', lineHeight: 1.75, margin: 0, fontWeight: 500 }}>{text}</p>
    </div>
  )
}

function SecHeader({ title, sub, accent }: { title: string; sub?: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 26 }}>
      <div style={{ width: 5, minHeight: 50, borderRadius: 3, background: accent || 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
      <div>
        <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20.5, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 6px' }}>{title}</h2>
        {sub && <p style={{ fontSize: 16, color: 'var(--text-3)', lineHeight: 1.6, margin: 0 }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── EXPANDABLE INSIGHT CARD ──────────────────────────────────────────────────
function InsightCard({ index, title, body, bullets, badge, badgeColor, extra, numbered = true, accent = 'var(--navy)' }:
  { index: number; title: string; body?: string; bullets?: string[]; badge?: string; badgeColor?: string; extra?: React.ReactNode; numbered?: boolean; accent?: string }) {
  const [open, setOpen] = useState(false)
  const has = !!(body || (bullets && bullets.length > 0) || extra)
  const bc = badgeColor || accent
  return (
    <div onClick={() => has && setOpen(o => !o)} style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${accent}`, borderRadius: '0 12px 12px 0', background: 'var(--bg-surface)', boxShadow: open ? '0 4px 20px rgba(27,54,93,0.1)' : 'var(--glow-card)', cursor: has ? 'pointer' : 'default', transition: 'box-shadow 200ms', marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px' }}>
        {numbered && <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: accent, flexShrink: 0, border: `1px solid ${accent}22`, fontFamily: 'Playfair Display,serif' }}>{index + 1}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
            <p style={{ fontSize: 15.5, color: 'var(--navy)', lineHeight: 1.5, margin: 0, fontWeight: 600, flex: 1 }}>{title}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {badge && <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${bc}15`, color: bc, border: `1px solid ${bc}33`, whiteSpace: 'nowrap' }}>{badge}</span>}
              {has && <ChevronDown size={14} style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />}
            </div>
          </div>
        </div>
      </div>
      {open && has && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', paddingTop: 14, animation: 'slideDown 200ms ease' }}>
          {body && <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.8, margin: '0 0 12px' }}>{body}</p>}
          {bullets && bullets.length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 8 }} />
                  <span style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.7 }}>{b}</span>
                </li>
              ))}
            </ul>
          )}
          {extra && <div style={{ marginTop: (body || bullets) ? 14 : 0 }}>{extra}</div>}
        </div>
      )}
    </div>
  )
}

// ─── DROPDOWN INSIGHT CARD ────────────────────────────────────────────────────
function DropdownInsightCard({ index, title, description, impact, urgency, confidence, whyItMatters, actions, meta }:
  { index: number; title: string; description: string; impact?: 'High' | 'Medium' | 'Low'; urgency?: 'High' | 'Medium' | 'Low'; confidence?: string; whyItMatters?: string; actions?: string[]; meta?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const hasBody = !!(whyItMatters || (actions && actions.length > 0))
  const priorityMap: Record<string, { label: string; bg: string; color: string; border: string; icon: string }> = {
    High: { label: 'HIGH IMPACT', bg: '#fff0f0', color: '#c62828', border: '#ffd0d0', icon: '🔥' },
    Medium: { label: 'MEDIUM IMPACT', bg: '#fffbec', color: '#b26a00', border: '#ffe8a0', icon: '⚡' },
    Low: { label: 'LOW IMPACT', bg: '#f0faf2', color: '#2e7d32', border: '#c8eace', icon: '📌' },
  }
  const imp = priorityMap[impact || 'Medium']
  const urgMap: Record<string, { color: string }> = { High: { color: '#c62828' }, Medium: { color: '#b26a00' }, Low: { color: '#2e7d32' } }
  const urg = urgMap[urgency || 'Medium']
  return (
    <div style={{ width: '100%', background: '#ffffff', border: '1px solid #dce5f1', borderRadius: 14, overflow: 'hidden', boxShadow: '0 3px 14px rgba(24,58,99,0.07)', transition: 'box-shadow 220ms', marginBottom: 10 }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(24,58,99,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 3px 14px rgba(24,58,99,0.07)'}>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 12, background: imp.bg, color: imp.color, border: `1px solid ${imp.border}` }}>
          {imp.icon} {imp.label}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.45, marginBottom: 8, color: '#183a63' }}>{title}</div>
        <div style={{ fontSize: 13.5, color: '#6c7c94', lineHeight: 1.6, marginBottom: 12 }}>{description}</div>
        {meta && <div style={{ marginBottom: 12 }}>{meta}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14, fontSize: 13 }}>
          {impact && <span style={{ color: '#5e6e86' }}>Impact: <b style={{ color: imp.color }}>{impact}</b></span>}
          {urgency && <span style={{ color: '#5e6e86' }}>Urgency: <b style={{ color: urg.color }}>{urgency}</b></span>}
          {confidence && <span style={{ color: '#5e6e86' }}>Confidence: <b style={{ color: '#183a63' }}>{confidence}</b></span>}
        </div>
        {hasBody && (
          <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6faff', border: '1px solid #e0eaf6', borderRadius: 10, padding: '11px 14px', cursor: 'pointer', transition: 'background 180ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#eaf2ff'}
            onMouseLeave={e => e.currentTarget.style.background = '#f6faff'}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#183a63' }}>
              {actions && actions.length > 0 ? `${actions.length} Recommended Action${actions.length > 1 ? 's' : ''}` : 'Why This Matters'}
            </span>
            <span style={{ color: '#183a63', fontSize: 12, transition: 'transform 220ms', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
          </div>
        )}
      </div>
      {hasBody && open && (
        <div style={{ animation: 'slideDown 200ms ease', borderTop: '1px solid #edf2f7' }}>
          <div style={{ padding: '4px 18px 18px' }}>
            {whyItMatters && (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#183a63', marginBottom: 8, marginTop: 14, textTransform: 'uppercase' }}>WHY THIS MATTERS</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: '#5f7088' }}>{whyItMatters}</div>
              </>
            )}
            {actions && actions.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#183a63', marginBottom: 2, marginTop: 16, textTransform: 'uppercase' }}>RECOMMENDED ACTIONS</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {actions.map((a, i) => (
                    <li key={i} style={{ padding: '9px 0', borderBottom: i < actions.length - 1 ? '1px solid #edf2f7' : 'none', color: '#42556d', fontSize: 13.5, lineHeight: 1.55 }}>
                      <span style={{ color: '#D4AF37', marginRight: 8, fontWeight: 700 }}>→</span>{a}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── BIG BET CARD ────────────────────────────────────────────────────────────
function BigBetCard({ bet, index, accent }: { bet: any; index: number; accent: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(o => !o)} style={{ border: '1px solid var(--border)', borderLeft: `5px solid ${accent}`, borderRadius: '0 16px 16px 0', background: 'var(--bg-surface)', boxShadow: open ? '0 6px 24px rgba(27,54,93,0.12)' : 'var(--glow-card)', cursor: 'pointer', transition: 'box-shadow 200ms', marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '20px 24px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: accent, flexShrink: 0 }}>{index + 1}</div>
            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2 }}>{bet.title}</div>
          </div>
          {bet.tag && <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${accent}12`, color: accent, border: `1px solid ${accent}30`, marginLeft: 40 }}>{bet.tag}</span>}
        </div>
        <ChevronDown size={18} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
      </div>
      {open && (
        <div style={{ padding: '0 24px 22px', borderTop: '1px solid var(--border)', paddingTop: 18, animation: 'slideDown 200ms ease' }}>
          {bet.body && <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.85, margin: '0 0 16px' }}>{bet.body}</p>}
          {bet.bullets && bet.bullets.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>KEY FACTS</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {bet.bullets.map((b: string, i: number) => (
                  <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 7 }} />
                    <span style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7 }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(bet.freyrResponse || bet.timeline) && (
            <div style={{ display: 'grid', gridTemplateColumns: bet.freyrResponse && bet.timeline ? '1fr 140px' : '1fr', gap: 12, marginTop: 14 }}>
              {bet.freyrResponse && (
                <div style={{ padding: '12px 16px', background: 'var(--navy-faint)', borderRadius: 10, border: '1px solid rgba(27,54,93,0.15)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>COMPANY RESPONSE</div>
                  <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600, lineHeight: 1.5 }}>{bet.freyrResponse}</div>
                </div>
              )}
              {bet.timeline && (
                <div style={{ padding: '12px 16px', background: 'rgba(212,175,55,0.08)', borderRadius: 10, border: '1px solid rgba(212,175,55,0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#b89428', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>TIMELINE</div>
                  <div style={{ fontSize: 14, color: '#8c6e00', fontWeight: 700 }}>{bet.timeline}</div>
                </div>
              )}
            </div>
          )}
          {bet.nudgeSignal && (
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'linear-gradient(135deg,rgba(27,54,93,0.08),transparent)', border: '1px solid rgba(27,54,93,0.15)', borderRadius: 10, display: 'flex', gap: 8 }}>
              <Zap size={14} style={{ color: '#D4AF37', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: 'var(--navy)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{bet.nudgeSignal}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── STRATEGIC PRIORITY CARD ─────────────────────────────────────────────────
function StratCard({ item, index, setActive }: { item: any; index: number; setActive?: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const PC: Record<string, any> = {
    'MOST URGENT': { bg: 'rgba(220,38,38,0.08)', c: '#dc2626', b: 'rgba(220,38,38,0.25)', a: '#dc2626' },
    'URGENT': { bg: 'rgba(234,88,12,0.08)', c: '#ea580c', b: 'rgba(234,88,12,0.25)', a: '#ea580c' },
    'HIGH': { bg: 'rgba(217,119,6,0.08)', c: '#d97706', b: 'rgba(217,119,6,0.25)', a: '#d97706' },
    'HIGHEST DURABILITY': { bg: 'rgba(217,119,6,0.08)', c: '#d97706', b: 'rgba(217,119,6,0.25)', a: '#d97706' },
    'EASIEST ENTRY': { bg: 'rgba(16,185,129,0.08)', c: '#10b981', b: 'rgba(16,185,129,0.25)', a: '#10b981' },
    'DIFFERENTIATED': { bg: 'rgba(124,58,237,0.08)', c: '#7C3AED', b: 'rgba(124,58,237,0.25)', a: '#7C3AED' },
    'NEAR-TERM': { bg: 'rgba(27,107,192,0.08)', c: '#1B6BC0', b: 'rgba(27,107,192,0.25)', a: '#1B6BC0' },
    'RESEARCH GAP': { bg: 'rgba(107,114,128,0.1)', c: '#6B7280', b: 'rgba(107,114,128,0.25)', a: '#6B7280' },
    'MEDIUM': { bg: 'rgba(27,107,192,0.08)', c: '#1B6BC0', b: 'rgba(27,107,192,0.25)', a: '#1B6BC0' },
    'ACTIVE': { bg: 'rgba(16,185,129,0.08)', c: '#10b981', b: 'rgba(16,185,129,0.25)', a: '#10b981' },
  }
  const pc = PC[item.priority] || PC['MEDIUM']
  const stakeholders: string[] = item.stakeholders || []

  return (
    <div style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${pc.a}`, borderRadius: '0 12px 12px 0', background: 'var(--bg-surface)', marginBottom: 10, boxShadow: open ? '0 4px 16px rgba(27,54,93,0.1)' : 'var(--glow-card)', overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', cursor: 'pointer' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${pc.a}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: pc.a, flexShrink: 0, border: `1px solid ${pc.a}30` }}>{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <p style={{ fontSize: 14.5, color: 'var(--navy)', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{item.title}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: pc.bg, color: pc.c, border: `1px solid ${pc.b}`, whiteSpace: 'nowrap' }}>{item.priority}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
            </div>
          </div>
          {stakeholders.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {stakeholders.map((name, si) => (
                <button key={si} onClick={e => { e.stopPropagation(); setActive && setActive('org-leadership') }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: 'var(--navy-faint)', color: 'var(--navy)', border: '1px solid rgba(27,54,93,0.18)', cursor: 'pointer', transition: 'all 140ms' }}
                  onMouseEnter={e => { e.currentTarget.style.background = pc.bg; e.currentTarget.style.color = pc.c; e.currentTarget.style.borderColor = pc.b }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--navy-faint)'; e.currentTarget.style.color = 'var(--navy)'; e.currentTarget.style.borderColor = 'rgba(27,54,93,0.18)' }}
                  title={`Go to Key Stakeholders — ${name}`}>
                  <Users size={10} /> {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: 14, animation: 'slideDown 200ms ease' }}>
          {item.body && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8, margin: '0 0 12px' }}>{item.body}</p>}
          {item.freyrAction && (
            <div style={{ padding: '12px 16px', background: 'var(--navy-faint)', borderRadius: 9, border: '1px solid rgba(27,54,93,0.15)', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>COMPANY ACTION</div>
              <p style={{ fontSize: 13.5, color: 'var(--navy)', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{item.freyrAction}</p>
            </div>
          )}
          {stakeholders.length > 0 && (
            <div style={{ padding: '12px 16px', background: 'rgba(27,54,93,0.04)', borderRadius: 9, border: '1px solid rgba(27,54,93,0.1)', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>KEY STAKEHOLDERS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {stakeholders.map((name, si) => (
                  <button key={si} onClick={e => { e.stopPropagation(); setActive && setActive('org-leadership') }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: `${pc.a}10`, color: pc.a, border: `1px solid ${pc.a}25`, cursor: 'pointer', transition: 'all 140ms' }}
                    onMouseEnter={e => { e.currentTarget.style.background = pc.bg }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${pc.a}10` }}>
                    <Users size={12} /> {name} <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {(item.nudgeSignal || item.whatThisMeansForFreyr) && (
            <div style={{ display: 'grid', gridTemplateColumns: item.nudgeSignal && item.whatThisMeansForFreyr ? '1fr 1fr' : '1fr', gap: 10 }}>
              {item.nudgeSignal && (
                <div style={{ padding: '12px 16px', background: 'rgba(27,54,93,0.05)', border: '1px solid rgba(27,54,93,0.12)', borderRadius: 9, display: 'flex', gap: 8 }}>
                  <Zap size={13} style={{ color: '#D4AF37', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>{item.nudgeSignal}</p>
                </div>
              )}
              {item.whatThisMeansForFreyr && (
                <div style={{ padding: '12px 16px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 9 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: '#b89428', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>WHAT THIS MEANS FOR COMPANY</div>
                  <p style={{ fontSize: 12.5, color: '#7a5c00', lineHeight: 1.6, margin: 0 }}>{item.whatThisMeansForFreyr}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── NEXT BEST ACTION CARD ───────────────────────────────────────────────────
function NBACard({ item, index }: { item: any; index: number }) {
  const [open, setOpen] = useState(false)
  const UC: Record<string, string> = { 'Immediate': '#dc2626', 'H2 2026': '#d97706', 'Q3 2026': '#d97706', 'Q4 2026': 'var(--navy)' }
  const uc = UC[item.urgency] || 'var(--navy)'
  return (
    <div onClick={() => setOpen(o => !o)} style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${uc}`, borderRadius: '0 12px 12px 0', background: 'var(--bg-surface)', cursor: 'pointer', marginBottom: 10, boxShadow: open ? '0 4px 16px rgba(27,54,93,0.1)' : 'var(--glow-card)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `${uc}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: uc, flexShrink: 0, border: `1px solid ${uc}22`, fontFamily: 'Playfair Display,serif' }}>{index + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <p style={{ fontSize: 14.5, color: 'var(--navy)', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{item.action}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ padding: '2px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: 'var(--navy-faint)', color: 'var(--navy)', whiteSpace: 'nowrap' }}>{item.priority}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border)', paddingTop: 14, animation: 'slideDown 200ms ease' }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8, margin: '0 0 12px' }}>{item.detail}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {item.owner && (
              <div style={{ padding: '8px 14px', background: 'var(--navy-faint)', borderRadius: 8, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>OWNER</div>
                <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{item.owner}</div>
              </div>
            )}
            <div style={{ padding: '8px 14px', background: `${uc}0d`, borderRadius: 8, border: `1px solid ${uc}25`, minWidth: 100, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: uc, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>URGENCY</div>
              <div style={{ fontSize: 13, color: uc, fontWeight: 700 }}>{item.urgency}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PERSON CARD ─────────────────────────────────────────────────────────────
function PersonCard({ person }: { person: any }) {
  const [open, setOpen] = useState(false)
  const RM: Record<string, { c: string; bg: string; label: string }> = {
    cold: { c: '#1B365D', bg: 'rgba(27,54,93,0.08)', label: 'Cold' },
    warm: { c: '#b89428', bg: 'rgba(212,175,55,0.12)', label: 'Warm' },
    hot: { c: '#dc2626', bg: 'rgba(220,38,38,0.1)', label: 'Hot' },
    active: { c: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Active' },
  }
  const rel = RM[(person.relationship || 'cold').toLowerCase()] || RM.cold
  const initials = (person.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)
  const AVC = ['#1B365D', '#7c3aed', '#0891b2', '#b89428', '#dc2626', '#059669']
  const avc = AVC[Math.abs((person.name || '').charCodeAt(0) - 65 || 0) % AVC.length]

  return (
    <div style={{ border: '1px solid var(--border)', borderLeft: `3px solid ${rel.c}`, borderRadius: '0 10px 10px 0', background: 'var(--bg-surface)', marginBottom: 8, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: avc, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2, marginBottom: 2 }}>{person.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.role || person.title}</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: rel.bg, color: rel.c, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: rel.c, display: 'inline-block' }} />
          {rel.label}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
      </div>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 14, animation: 'slideDown 200ms ease' }}>
          {person.insight && <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 14px' }}>{person.insight}</p>}

          {person.dos && person.donts && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>✓ Do</div>
                {person.dos.map((d: string, i: number) => (
                  <div key={i} style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 5, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }}>•</span><span>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>✕ Don't</div>
                {person.donts.map((d: string, i: number) => (
                  <div key={i} style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 5, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }}>•</span><span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {person.conference && (
            <div style={{ fontSize: 12.5, color: 'var(--navy)', fontWeight: 600, padding: '6px 10px', background: 'var(--navy-faint)', borderRadius: 6, marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
              <span>🎤</span><span>{person.conference}</span>
            </div>
          )}

          {person.signals && person.signals.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: person.sellingPoint ? 10 : 0 }}>
              {person.signals.map((s: string) => (
                <span key={s} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(27,54,93,0.07)', color: 'var(--navy)', border: '1px solid rgba(27,54,93,0.12)' }}>⚡ {s}</span>
              ))}
            </div>
          )}

          {person.sellingPoint && (
            <div style={{ padding: '10px 14px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#b89428', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Company Selling Point</div>
              <p style={{ fontSize: 13, color: '#7a5c00', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{person.sellingPoint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── SIGNAL DETAIL MODAL ──────────────────────────────────────────────────────
interface SignalDetail { name: string; source: string; evidence: string; reference: string; references?: { label: string; url: string }[]; implication: string }
function SignalModal({ signal, onClose }: { signal: SignalDetail | null; onClose: () => void }) {
  if (!signal) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 160ms ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 680, maxWidth: '92vw', background: '#fff', borderRadius: 14, overflow: 'hidden', animation: 'popIn 180ms ease-out', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
        <div style={{ borderTop: '5px solid #D4AF37', padding: '22px 26px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', right: 20, top: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, color: '#888', lineHeight: 1 }}>×</button>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#7E8794', textTransform: 'uppercase', marginBottom: 6 }}>SIGNAL DETAIL</div>
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 24, fontWeight: 700, color: '#1B365D', lineHeight: 1.2 }}>{signal.name}</div>
        </div>
        <div style={{ padding: '16px 26px', borderTop: '1px solid #EDF1F5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#7E8794', textTransform: 'uppercase', marginBottom: 6 }}>SOURCE</div>
          <div style={{ fontSize: 14, color: '#1B365D', lineHeight: 1.55 }}>{signal.source}</div>
        </div>
        <div style={{ padding: '16px 26px', borderTop: '1px solid #EDF1F5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#7E8794', textTransform: 'uppercase', marginBottom: 6 }}>EVIDENCE</div>
          <div style={{ fontSize: 14, color: '#1B365D', lineHeight: 1.65 }}>{signal.evidence}</div>
        </div>
        <div style={{ padding: '16px 26px', borderTop: '1px solid #EDF1F5' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#7E8794', textTransform: 'uppercase', marginBottom: 8 }}>REFERENCES</div>
          {signal.references && signal.references.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signal.references.map((ref, i) => (
                <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0A66C2', textDecoration: 'none', lineHeight: 1.45 }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  {ref.label}
                </a>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.55 }}>{signal.reference}</div>
          )}
        </div>
        <div style={{ margin: '0 20px 20px', background: '#1B365D', borderRadius: 10, padding: '18px 22px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#D4AF37', textTransform: 'uppercase', marginBottom: 8 }}>COMPANY IMPLICATION</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 1.7 }}>{signal.implication}</div>
        </div>
      </div>
    </div>
  )
}

// ─── COMPETITIVE INTELLIGENCE (real STRATEGIC_HYPOTHESES + CompetitorSignal data) ──
function CompetitiveIntel({ accountId }: { accountId: string }) {
  const [activeModal, setActiveModal] = useState<SignalDetail | null>(null)
  const hypotheses = STRATEGIC_HYPOTHESES.filter(h => h.account_ids.includes(accountId))

  if (hypotheses.length === 0) {
    return <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7 }}>No competitor is currently tied to this account in the Competition module's tracked hypotheses.</p>
  }

  const toSignalDetail = (sig: any, implication: string): SignalDetail => ({
    name: sig.headline,
    source: `${sig.source_name}${sig.signal_date ? ` · ${sig.signal_date}` : ''}`,
    evidence: sig.what_happened,
    reference: sig.source_name,
    references: sig.source_url ? [{ label: sig.source_name, url: sig.source_url }] : undefined,
    implication,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {activeModal && <SignalModal signal={activeModal} onClose={() => setActiveModal(null)} />}
      {hypotheses.map((h, i) => {
        const competitor = COMPETITORS.find(c => c.id === h.competitor_id)
        const signals = COMPETITOR_SIGNALS.filter(s => s.competitor_id === h.competitor_id).slice(0, 6)
        return (
          <div key={h.id} style={{ background: '#1B365D', borderRadius: 12, padding: '22px 18px 20px', position: 'relative', color: 'white', boxShadow: '0 8px 24px rgba(27,54,93,0.22)' }}>
            <div style={{ position: 'absolute', top: -8, left: 18, width: 44, height: 52, background: '#D4AF37', color: '#1B365D', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, clipPath: 'polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)' }}>{i + 1}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28, marginBottom: 6 }}>
              {competitor && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'rgba(212,175,55,0.2)', color: '#FFD86A' }}>{competitor.name}</span>}
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}>{h.confidence} confidence</span>
            </div>
            <h3 style={{ marginBottom: 10, fontFamily: 'Playfair Display,serif', fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>{h.title}</h3>
            <p style={{ color: 'rgba(228,234,242,0.88)', lineHeight: 1.65, fontSize: 14, margin: 0 }}>{h.hypothesis}</p>
            <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 9 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#FFD86A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>COMPANY ANGLE</div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, margin: 0 }}>{h.indegene_angle}</p>
            </div>
            {signals.length > 0 && (<>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.14)', margin: '16px 0 13px' }} />
              <div style={{ fontSize: 11, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10, color: '#DCE6F3', textTransform: 'uppercase' }}>{competitor?.name ?? 'COMPETITOR'} SIGNALS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {signals.map(sig => (
                  <button key={sig.id} onClick={() => setActiveModal(toSignalDetail(sig, h.indegene_angle))}
                    style={{ border: '1px solid #D4AF37', color: '#FFD86A', padding: '7px 11px', borderRadius: 6, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, background: 'transparent', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#D4AF37'; e.currentTarget.style.color = '#1B365D'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFD86A'; e.currentTarget.style.transform = 'none' }}>
                    {sig.headline}
                  </button>
                ))}
              </div>
            </>)}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#DCE6F3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>NEXT BEST STEPS</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'rgba(228,234,242,0.88)', lineHeight: 1.7 }}>
                {h.next_best_steps.map((s, si) => <li key={si}>{s}</li>)}
              </ul>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── SALES INTELLIGENCE DEEP DIVE (Signal Matrix, 90-Day Roadmap, Stakeholder Tone) ──
// Built from this same account's already-real fields (strategicPriorities, bigBets,
// nextBestAction, actionPlan90Day, orgLeadership) reshaped into the original's three
// table/board formats — no invented facts, just a different view of real data.
function SalesIntel({ info }: { info: any }) {
  const matrixRows = (info.strategicPriorities ?? []).slice(0, 5).map((p: any, i: number) => {
    const bet = (info.bigBets ?? [])[i]
    const action = (info.nextBestAction ?? [])[i]
    return {
      hypothesis: p.title,
      s1: p.stakeholders?.[0] ?? p.priority,
      s2: bet?.title ?? p.priority,
      s3: bet?.timeline ?? '—',
      action: p.freyrAction ?? action?.action ?? p.body,
      priority: p.priority,
    }
  })

  const bucket = (weeks: string) => {
    const n = parseInt(weeks, 10)
    if (Number.isNaN(n)) return 'scale'
    if (n <= 2) return 'activate'
    if (n <= 6) return 'expand'
    return 'scale'
  }
  const steps = info.actionPlan90Day?.steps ?? []
  const columns = [
    { key: 'activate', label: 'DAYS 1–30 — ACTIVATE', c: '#dc2626' },
    { key: 'expand', label: 'DAYS 31–60 — EXPAND', c: '#d97706' },
    { key: 'scale', label: 'DAYS 61–90 — SCALE', c: '#10b981' },
  ]

  const RM: Record<string, string> = { cold: 'Trusted-advisor introduction, no assumed relationship', warm: 'Warm relationship-building, reference prior context', hot: 'Direct commercial conversation, urgency-led', active: 'Standing partner conversation, delivery-proof led' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {matrixRows.length > 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 14, borderBottom: '2px solid var(--border)', paddingBottom: 10 }}>1 — Signal Combination Matrix</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead><tr style={{ background: 'var(--navy)', color: '#fff' }}>
                {['HYPOTHESIS', 'SIGNAL 1', 'SIGNAL 2', 'SIGNAL 3', 'RECOMMENDED ACTION', 'PRIORITY'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {matrixRows.map((r: any, i: number) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-raised)' }}>
                    <td style={{ padding: '11px 14px', color: 'var(--navy)', borderBottom: '1px solid var(--border)', fontWeight: 500, lineHeight: 1.55, maxWidth: 180 }}>{r.hypothesis}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}><span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(27,54,93,0.07)', color: 'var(--navy)', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>{r.s1}</span></td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}><span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(27,54,93,0.07)', color: 'var(--navy)', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>{r.s2}</span></td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}><span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(27,54,93,0.07)', color: 'var(--navy)', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>{r.s3}</span></td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)', lineHeight: 1.6, maxWidth: 220 }}>{r.action}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: /URGENT|MOST/i.test(r.priority) ? 'rgba(220,38,38,0.1)' : /HIGH/i.test(r.priority) ? 'rgba(217,119,6,0.1)' : 'rgba(27,54,93,0.08)', color: /URGENT|MOST/i.test(r.priority) ? '#dc2626' : /HIGH/i.test(r.priority) ? '#d97706' : 'var(--navy)' }}>{r.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 14, borderBottom: '2px solid var(--border)', paddingBottom: 10 }}>2 — 90-Day Action Roadmap</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {columns.map(col => (
              <div key={col.key} style={{ background: `${col.c}0a`, border: `1px solid ${col.c}25`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: col.c, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>{col.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {steps.filter((s: any) => bucket(s.weeks) === col.key).map((s: any, i: number) => (
                    <div key={i} style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>{s.action}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(info.orgLeadership ?? []).length > 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 14, borderBottom: '2px solid var(--border)', paddingBottom: 10 }}>3 — Engagement Tone by Stakeholder</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead><tr style={{ background: 'var(--navy)', color: '#fff' }}>
                {['STAKEHOLDER', 'LEAD WITH', 'TONE', 'AVOID', 'ROLE'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {info.orgLeadership.map((p: any, i: number) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-raised)' }}>
                    <td style={{ padding: '11px 14px', color: 'var(--navy)', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{p.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)', lineHeight: 1.5 }}>{p.dos?.[0] ?? '—'}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>{RM[(p.relationship || 'cold').toLowerCase()] ?? RM.cold}</td>
                    <td style={{ padding: '11px 14px', color: '#dc2626', borderBottom: '1px solid var(--border)', lineHeight: 1.5 }}>{p.donts?.[0] ?? '—'}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}><span style={{ padding: '2px 9px', borderRadius: 999, background: 'var(--navy-faint)', color: 'var(--navy)', fontSize: 11, fontWeight: 700 }}>{p.role.split(',')[0]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Company SIGNAL INTELLIGENCE (Company Profile / Key Signals / Competitive Intelligence / Sales Intel) ──
function NudgeIntel({ accountId, accountName, info }: { accountId: string; accountName: string; info: any }) {
  const [tab, setTab] = useState<'companyProfile' | 'keySignals' | 'competitiveIntelligence' | 'salesIntelligence'>('companyProfile')
  const [activeSignalModal, setActiveSignalModal] = useState<SignalDetail | null>(null)
  const data = Company_PROFILE[accountId]
  if (!data) return null
  const tabs: [typeof tab, string][] = [
    ['companyProfile', 'Company Profile'],
    ['keySignals', 'Key Signals'],
    ['competitiveIntelligence', 'Competitive Intelligence'],
    ['salesIntelligence', 'Sales Intelligence'],
  ]

  const getSignalDetail = (card: any, signalName: string): SignalDetail => {
    if (card.signalDetails?.[signalName]) return { name: signalName, ...card.signalDetails[signalName] }
    return { name: signalName, source: 'Company Intelligence Signal', evidence: `Detected signal: ${signalName}`, reference: 'Account Intelligence', implication: 'See the full card context for the Company implication.' }
  }

  const renderNavyCards = (cards: any[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {(cards || []).map((c: any, i: number) => (
        <div key={c.title} style={{ background: '#1B365D', borderRadius: 12, padding: '22px 18px 20px', position: 'relative', color: 'white', boxShadow: '0 8px 24px rgba(27,54,93,0.22)' }}>
          <div style={{ position: 'absolute', top: -8, left: 18, width: 44, height: 52, background: '#D4AF37', color: '#1B365D', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, clipPath: 'polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)' }}>{i + 1}</div>
          <h3 style={{ marginTop: 28, marginBottom: 10, fontFamily: 'Playfair Display,serif', fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>{c.title}</h3>
          <p style={{ color: 'rgba(228,234,242,0.88)', lineHeight: 1.65, fontSize: 14, margin: 0 }}>{c.body}</p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.14)', margin: '16px 0 13px' }} />
          <div style={{ fontSize: 11, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10, color: '#DCE6F3', textTransform: 'uppercase' }}>SIGNALS TRIANGULATED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {(c.signals || []).map((s: string) => (
              <button key={s} onClick={() => setActiveSignalModal(getSignalDetail(c, s))}
                style={{ border: '1px solid #D4AF37', color: '#FFD86A', padding: '7px 11px', borderRadius: 6, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, background: 'transparent', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#D4AF37'; e.currentTarget.style.color = '#1B365D'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#FFD86A'; e.currentTarget.style.transform = 'none' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      {activeSignalModal && <SignalModal signal={activeSignalModal} onClose={() => setActiveSignalModal(null)} />}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '8px 18px', borderRadius: 22, cursor: 'pointer', fontSize: 14, fontWeight: 700, border: tab === k ? 'none' : '1px solid var(--border)', background: tab === k ? 'var(--navy)' : 'var(--bg-surface)', color: tab === k ? '#fff' : 'var(--text-2)', transition: 'all 160ms', boxShadow: tab === k ? '0 2px 10px rgba(27,54,93,0.25)' : 'none' }}>{l}</button>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.04em', marginBottom: 16 }}>
        Company Signal Intelligence — {tabs.find(t => t[0] === tab)![1]} · {accountName}
      </div>

      {tab === 'companyProfile' && renderNavyCards(data.companyProfile)}
      {tab === 'keySignals' && renderNavyCards(data.keySignals)}
      {tab === 'competitiveIntelligence' && <CompetitiveIntel accountId={accountId} />}
      {tab === 'salesIntelligence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {renderNavyCards(data.salesIntelligence)}
          <SalesIntel info={info} />
        </div>
      )}
    </div>
  )
}

// ─── PIPELINE SECTION ────────────────────────────────────────────────────────
function PipelineSection({ info }: { info: any }) {
  const [openT, setOpenT] = useState<number | null>(null)
  const pi = info.pipelineInsights
  if (!pi) return <p style={{ fontSize: 15, color: 'var(--navy)', lineHeight: 1.85 }}>Pipeline data not available.</p>
  return (
    <div>
      {pi.summary && <div style={{ padding: '18px 22px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24, boxShadow: 'var(--glow-card)' }}><p style={{ fontSize: 15, color: 'var(--navy)', lineHeight: 1.85, margin: 0 }}>{pi.summary}</p></div>}
      {pi.assetProfile && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 14 }}>Asset Profile — Regulatory Lifecycle</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {pi.assetProfile.map((item: any, i: number) => (
              <DropdownInsightCard key={i} index={i}
                title={item.dimension}
                description={item.detail || `Status: ${item.status}`}
                impact={/GAP|URGENT|CRITICAL/i.test(item.status) ? 'High' : /REVIEW|PIPELINE/i.test(item.status) ? 'Medium' : 'Low'}
                urgency={/GAP|URGENT|CRITICAL/i.test(item.status) ? 'High' : 'Medium'}
                confidence={['95%', '92%', '89%', '86%', '82%', '78%'][i % 6]}
                meta={<span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: /GAP|URGENT/i.test(item.status) ? 'rgba(220,38,38,0.1)' : /APPROVED|COMMERCIAL|ACTIVE/i.test(item.status) ? 'rgba(16,185,129,0.1)' : 'rgba(217,119,6,0.1)', color: /GAP|URGENT/i.test(item.status) ? '#dc2626' : /APPROVED|COMMERCIAL|ACTIVE/i.test(item.status) ? '#10b981' : '#d97706' }}>{item.status}</span>}
                whyItMatters={`This regulatory lifecycle stage directly determines Company's service entry point and revenue timing.`}
              />
            ))}
          </div>
        </div>
      )}
      {pi.revenueTimeline && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 12 }}>Revenue Timeline — 3-Year Projection</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead><tr style={{ background: 'var(--navy)', color: '#fff' }}>
                {['Service Track', 'FY2026 H2', 'FY2027', 'FY2028', '3-Year Total', 'Urgency'].map(h => <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {pi.revenueTimeline.map((r: any, i: number) => {
                  const tot = r.service.includes('TOTAL')
                  return (
                    <tr key={i} style={{ background: tot ? 'var(--navy-faint)' : i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-raised)' }}>
                      <td style={{ padding: '10px 14px', color: 'var(--navy)', borderBottom: '1px solid var(--border)', fontWeight: tot ? 800 : 600 }}>{r.service}</td>
                      {[r.fy26h2, r.fy27, r.fy28, r.total].map((v: string, j: number) => <td key={j} style={{ padding: '10px 14px', color: tot ? 'var(--gold-muted)' : 'var(--text-2)', borderBottom: '1px solid var(--border)', fontWeight: tot ? 800 : 500 }}>{v}</td>)}
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(27,54,93,0.08)', color: 'var(--navy)' }}>{r.urgency}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {pi.technologyPipeline && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 12 }}>Technology Platform — Sales Stage &amp; Entry Path</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pi.technologyPipeline.map((t: any, i: number) => (
              <div key={i} onClick={() => setOpenT(openT === i ? null : i)} style={{ display: 'grid', gridTemplateColumns: '190px 1fr 110px 30px', gap: 14, padding: '13px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', boxShadow: 'var(--glow-card)' }}>
                <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>{t.platform}</div>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{t.entryPath}</p>
                  {openT === i && t.nextAction && <div style={{ marginTop: 8, fontSize: 12.5, color: '#10b981', fontWeight: 600, animation: 'slideDown 200ms ease' }}>→ {t.nextAction}</div>}
                </div>
                <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, height: 'fit-content', background: /NEAR/i.test(t.stage) ? 'rgba(16,185,129,0.1)' : 'rgba(27,54,93,0.08)', color: /NEAR/i.test(t.stage) ? '#10b981' : 'var(--navy)' }}>{t.stage}</span>
                <ChevronDown size={13} style={{ color: 'var(--text-3)', transform: openT === i ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', marginTop: 2 }} />
              </div>
            ))}
          </div>
        </div>
      )}
      {pi.landExpandTransform && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 14 }}>Land → Expand → Transform: 3-Year Account Ambition</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {pi.landExpandTransform.split('|').map((phase: string, i: number) => {
              const colors = ['#1B365D', '#D4AF37', '#10b981']
              const labels = ['🌱 LAND', '📈 EXPAND', '🚀 TRANSFORM']
              const parts = phase.trim().split(':')
              return (
                <div key={i} style={{ padding: '16px 18px', background: 'var(--bg-surface)', borderTop: `3px solid ${colors[i]}`, borderRadius: '0 0 12px 12px', border: '1px solid var(--border)', boxShadow: 'var(--glow-card)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: colors[i], textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{labels[i]}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{parts.slice(1).join(':').trim()}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── NEWS MODAL ──────────────────────────────────────────────────────────────
function NewsModal({ article, onClose }: { article: any; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(13,26,46,0.55)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'fadeIn 140ms ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 680, maxWidth: '94vw', background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 30px 80px rgba(13,26,46,0.4)', animation: 'popIn 180ms cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{article.date}</span>
            <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, marginTop: 5, lineHeight: 1.3, color: 'var(--navy)', margin: '5px 0 0' }}>{article.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', flexShrink: 0 }}><X size={20} /></button>
        </div>
        <div style={{ height: 3, background: 'linear-gradient(90deg,var(--gold),var(--navy))', marginBottom: 20, borderRadius: 2 }} />
        <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.85 }}>{article.body}</p>
      </div>
    </div>
  )
}

// ─── LAYER NAV ACCORDION ─────────────────────────────────────────────────────
function LayerNav({ layer, active, setActive }: { layer: any; active: string; setActive: (id: string) => void }) {
  const isLayerActive = layer.items.some((i: any) => i.id === active)
  const [open, setOpen] = useState<boolean>(isLayerActive)
  useEffect(() => { if (isLayerActive) setOpen(true) }, [isLayerActive])

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '9px 12px 9px 14px', background: isLayerActive ? `${layer.color}12` : 'transparent', border: 'none', borderLeft: `3px solid ${isLayerActive ? layer.color : 'transparent'}`, cursor: 'pointer', transition: 'background 120ms' }}
        onMouseEnter={e => { if (!isLayerActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
        onMouseLeave={e => { e.currentTarget.style.background = isLayerActive ? `${layer.color}12` : 'transparent' }}>
        <span style={{ fontSize: 16, flexShrink: 0, marginRight: 8, lineHeight: 1 }}>{layer.icon}</span>
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: isLayerActive ? layer.color : '#334155', textAlign: 'left', lineHeight: 1 }}>{layer.label}</span>
        <ChevronDown size={13} style={{ color: isLayerActive ? layer.color : '#94a3b8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms', flexShrink: 0 }} />
      </button>

      {open && layer.items.map((item: any) => {
        const isActive = active === item.id
        return (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '8px 12px 8px 34px', background: isActive ? `${layer.color}14` : 'transparent', border: 'none', borderLeft: `3px solid ${isActive ? layer.color : 'transparent'}`, cursor: 'pointer', transition: 'background 120ms' }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${layer.color}14` : 'transparent' }}>
            <span style={{ fontSize: 13, flexShrink: 0, marginRight: 8, lineHeight: 1, color: isActive ? layer.color : '#94a3b8' }}>{item.icon}</span>
            <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500, color: isActive ? layer.color : '#475569', lineHeight: 1.2, textAlign: 'left' }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── FLIP CARD COMPONENT ─────────────────────────────────────────────────────
function FlipCard({ icon, cat, front, sub, back, accentColor }: { icon: string; cat: string; front: string; sub: string; back: string; accentColor?: string }) {
  const [flipped, setFlipped] = useState(false)
  const accent = accentColor || '#D4AF37'
  return (
    <div className={`flip-card${flipped ? ' flipped' : ''}`} style={{ height: 280 }} onClick={() => setFlipped(f => !f)}>
      <div className="flip-card-inner">
        <div className="flip-face flip-front" style={{ borderTop: `4px solid ${accent}` }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, marginBottom: 10, flexShrink: 0 }}>{icon || '•'}</div>
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: accent, marginBottom: 6, lineHeight: 1.2 }}>{cat}</div>
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 17, fontWeight: 700, color: '#1B365D', marginBottom: 5, lineHeight: 1.25, flex: '0 0 auto' }}>{front}</div>
          <div style={{ fontSize: 12.5, color: '#667085', lineHeight: 1.4, flex: 1 }}>{sub}</div>
          <div style={{ fontSize: 11, color: '#aab4c0', marginTop: 8, flex: '0 0 auto' }}>Click to flip →</div>
        </div>
        <div className="flip-face flip-back">
          <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: accent, marginBottom: 8, lineHeight: 1.2, flex: '0 0 auto', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 8 }}>{cat}</div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.92)', margin: 0, whiteSpace: 'pre-line' }}>{back}</p>
          </div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginTop: 6, flex: '0 0 auto' }}>↑ Scroll · Click to flip back</div>
        </div>
      </div>
    </div>
  )
}

// ─── ACCOUNT DOSSIER GENERATOR ────────────────────────────────────────────────
function generateAccountDossierHtml(info: any): string {
  const esc = (s: any) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const navy = '#1B365D'
  const gold = '#D4AF37'
  const sec = (title: string, content: string) => content ? `<div class="section"><div class="section-title">${esc(title)}</div>${content}</div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${esc(info.name)} — Account Intelligence Dossier</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;font-size:14px;color:#1a2a3a;background:#f4f6fa}
  .page{max-width:960px;margin:0 auto;padding:40px 32px;background:#fff;min-height:100vh}
  .header{background:${navy};border-radius:16px;padding:28px 32px;margin-bottom:32px;color:#fff}
  .header h1{font-size:28px;font-weight:800;margin-bottom:6px}
  .header p{font-size:14px;color:rgba(255,255,255,0.75);line-height:1.6}
  .nudge-signal{background:rgba(212,175,55,0.1);border:1.5px solid ${gold};border-radius:12px;padding:18px 22px;margin-bottom:28px}
  .nudge-signal .ns-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:${gold};margin-bottom:8px}
  .nudge-signal p{font-size:14px;color:${navy};line-height:1.75}
  .section{margin-bottom:28px}
  .section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:${gold};margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #e8edf5}
  .card{background:#f4f6fa;border-radius:10px;padding:16px;border:1px solid #e0e8f0;margin-bottom:10px}
  .label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#5a7499;margin-bottom:5px}
  .val{font-size:14px;color:${navy};line-height:1.75;white-space:pre-wrap}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .stat{background:#f4f6fa;border-radius:10px;padding:14px;border:1px solid #e0e8f0;text-align:center}
  .stat-val{font-size:20px;font-weight:800;color:${navy};margin-bottom:4px}
  .stat-label{font-size:12px;color:#5a7499;font-weight:600}
  .priority{border-left:4px solid ${gold};padding:14px 18px;background:#f4f6fa;border-radius:0 10px 10px 0;margin-bottom:10px}
  .priority-num{font-size:12px;font-weight:700;color:${gold};margin-bottom:4px}
  .priority-title{font-size:14px;font-weight:700;color:${navy};margin-bottom:6px}
  .priority-body{font-size:13px;color:#4a6080;line-height:1.65}
  .swot-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .swot-s{border-top:4px solid #10b981}.swot-w{border-top:4px solid #dc2626}
  .swot-o{border-top:4px solid #b89428}.swot-t{border-top:4px solid ${navy}}
  .nba{padding:12px 16px;background:#f4f6fa;border-left:4px solid ${navy};border-radius:0 8px 8px 0;margin-bottom:8px}
  .nba-action{font-size:14px;font-weight:700;color:${navy};margin-bottom:4px}
  .nba-detail{font-size:13px;color:#4a6080;line-height:1.6}
  .bullet{font-size:13px;color:#4a6080;line-height:1.65;padding:4px 0 4px 16px;border-left:2px solid #e0e8f0;margin-bottom:6px}
  .footer{text-align:center;padding:24px;color:#8a9baf;font-size:12px;border-top:1px solid #e0e8f0;margin-top:32px}
  @media print{body{background:#fff}.page{padding:20px}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${esc(info.name)}</h1>
    <p>Account Intelligence Dossier · Generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
  </div>
  ${info.nudgeSignal ? `<div class="nudge-signal"><div class="ns-label">⚡ Company Intelligence Signal</div><p>${esc(info.nudgeSignal)}</p></div>` : ''}
  ${info.accountContext ? sec('Account Context', `<div class="val">${esc(info.accountContext)}</div>`) : ''}
  ${(info.financialSnapshot || []).length ? sec('Financial Snapshot', `<div class="grid-4">${(info.financialSnapshot || []).map((f: any) => `<div class="stat"><div class="stat-val">${esc(f.value)}</div><div class="stat-label">${esc(f.label)}</div></div>`).join('')}</div>`) : ''}
  ${(info.emergingPriorities || []).length ? sec('Emerging Priorities', `${(info.emergingPriorities || []).map((p: string, i: number) => `<div class="bullet">${i + 1}. ${esc(p)}</div>`).join('')}`) : ''}
  ${(info.strategicPriorities || []).length ? sec('Strategic Priorities', `${(info.strategicPriorities || []).map((p: any, i: number) => `<div class="priority" style="border-color:${p.priority === 'MOST URGENT' ? '#dc2626' : p.priority === 'URGENT' ? '#ea580c' : p.priority === 'HIGH' ? '#d97706' : p.priority === 'ACTIVE' ? '#10b981' : '#1B365D'}"><div class="priority-num">${i + 1} · ${esc(p.priority)}</div><div class="priority-title">${esc(p.title)}</div>${p.body ? `<div class="priority-body">${esc(p.body)}</div>` : ''}${p.freyrAction ? `<div class="label" style="margin-top:10px">COMPANY ACTION</div><div class="priority-body">${esc(p.freyrAction)}</div>` : ''}</div>`).join('')}`) : ''}
  ${(info.orgLeadership || []).length ? sec('Key Stakeholders', `<div class="grid-2">${(info.orgLeadership || []).map((p: any) => `<div class="card"><div class="label">${esc(p.role)}</div><div class="val" style="font-weight:700;margin-bottom:6px">${esc(p.name)}</div>${p.insight ? `<div style="font-size:12.5px;color:#4a6080;line-height:1.6">${esc(p.insight)}</div>` : ''}${(p.dos || []).length ? `<div class="label" style="margin-top:8px">DOS</div>${p.dos.map((d: string) => `<div style="font-size:12px;color:#059669;margin-bottom:2px">✓ ${esc(d)}</div>`).join('')}` : ''}${(p.donts || []).length ? `<div class="label" style="margin-top:6px">DON'TS</div>${p.donts.map((d: string) => `<div style="font-size:12px;color:#dc2626;margin-bottom:2px">✗ ${esc(d)}</div>`).join('')}` : ''}</div>`).join('')}</div>`) : ''}
  ${info.swot ? sec('SWOT Analysis', `<div class="swot-grid">${[['S', 'Strengths', 'swot-s'], ['W', 'Weaknesses', 'swot-w'], ['O', 'Opportunities', 'swot-o'], ['T', 'Threats', 'swot-t']].map(([k, l, cls]) => `<div class="card ${cls}"><div class="label">${l}</div>${((info.swot as any)[k] || []).map((item: string) => `<div class="bullet">• ${esc(item)}</div>`).join('')}</div>`).join('')}</div>`) : ''}
  ${(info.nextBestAction || []).length ? sec('Next Best Actions', `${(info.nextBestAction || []).map((a: any, i: number) => `<div class="nba"><div class="nba-action">${i + 1}. ${esc(a.action || a.title || '')}</div>${a.detail ? `<div class="nba-detail">${esc(a.detail)}</div>` : ''}${a.owner ? `<div style="font-size:12px;color:#5a7499;margin-top:4px;font-weight:600">Owner: ${esc(a.owner)} · ${esc(a.urgency || a.priority || '')}</div>` : ''}</div>`).join('')}`) : ''}
  ${(info.bigBets || []).length ? sec('Big Bets', `${(info.bigBets || []).map((b: any, i: number) => `<div class="card" style="margin-bottom:12px">${b.tag ? `<div class="label">${esc(b.tag)}</div>` : ''}<div class="val" style="font-weight:700;margin-bottom:6px">${i + 1}. ${esc(b.title || b)}</div>${b.body ? `<div style="font-size:13px;color:#4a6080;line-height:1.65;margin-bottom:8px">${esc(b.body)}</div>` : ''}${(b.bullets || []).map((x: string) => `<div class="bullet">• ${esc(x)}</div>`).join('')}${b.freyrResponse ? `<div class="label" style="margin-top:8px">COMPANY RESPONSE</div><div style="font-size:13px;color:${navy};line-height:1.65">${esc(b.freyrResponse)}</div>` : ''}</div>`).join('')}`) : ''}
  ${info.investmentStrategy ? sec('Investment Strategy', `<div class="val">${esc(info.investmentStrategy)}</div>`) : ''}
  <div class="footer">The Company Intelligence · Powered by Company · Confidential — Internal Use Only · ${new Date().getFullYear()}</div>
</div>
<script>window.onload=()=>window.print()</script>
</body>
</html>`
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function AccountInfoPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [active, setActive] = useState('nudge')
  const [newsTab, setNewsTab] = useState<'internal' | 'external'>('internal')
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [notes, setNotes] = useState(() => (id && localStorage.getItem(`nudge_notes_${id}`)) || '')

  const account = ACCOUNTS_LIST.find((a: any) => a.id === id)
  const info = id ? ACCOUNT_INFO[id] : null

  useEffect(() => { setActive('nudge'); window.scrollTo({ top: 0 }) }, [id])

  if (!account || !info) {
    return (
      <div>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 26, color: 'var(--navy)', margin: '0 0 8px' }}>Account Info</h1>
        <p style={{ fontSize: 14.5, color: 'var(--text-3)', marginBottom: 24 }}>Select an account to view detailed intelligence.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ACCOUNTS_LIST.map((a: any) => (
            <div key={a.id} className="card card-clickable" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => nav(`/accounts/${a.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 5, height: 40, borderRadius: 3, background: 'var(--gold)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 17, fontWeight: 700, color: 'var(--navy)' }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{a.executivesMapped} executives mapped</div>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: 'var(--gold-muted)' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const externalNews = NEWS_EXTERNAL_BY_ACCOUNT[id!] ?? []
  const news = newsTab === 'internal' ? NEWS_INTERNAL : externalNews
  const rightToWinPlays = info.rightToWinPlays ?? []

  return (
    <Ctx.Provider value={active}>
      <div style={{ paddingBottom: 40 }}>
        <style>{`
          .flip-card { perspective:1500px; cursor:pointer; }
          .flip-card-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d; transition:transform 0.7s cubic-bezier(0.4,0,0.2,1); }
          .flip-card.flipped .flip-card-inner { transform:rotateY(180deg); }
          .flip-face { position:absolute; inset:0; border-radius:18px; backface-visibility:hidden; overflow:hidden; padding:20px; display:flex; flex-direction:column; }
          .flip-front { background:white; border:1px solid #E5E7EB; border-top:5px solid #D4AF37; box-shadow:0 10px 28px rgba(27,54,93,0.09); }
          .flip-back { background:linear-gradient(135deg,#1B365D 0%,#243e6b 100%); color:white; transform:rotateY(180deg); box-shadow:0 10px 28px rgba(27,54,93,0.22); }
          .flip-card:hover:not(.flipped) { transform:translateY(-4px); transition:transform 0.2s; }
          @keyframes pageIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
          @keyframes slideDown { from { opacity:0; max-height:0; } to { opacity:1; max-height:2000px; } }
        `}</style>

        <div style={{ marginBottom: 6 }}>
          <button onClick={() => nav('/accounts')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, fontWeight: 600, padding: '6px 0', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--navy)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
            <ArrowLeft size={14} /> Back to Accounts
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 5 }}>ACCOUNT INTELLIGENCE JOURNEY</div>
            <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 20.5, color: 'var(--navy)', margin: '0 0 8px', fontWeight: 700 }}>{account.name}</h1>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {NAV_LAYERS.map(l => {
                const isActive = l.items.some(i => i.id === active)
                return (
                  <span key={l.id} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: isActive ? `${l.color}18` : 'var(--bg-raised)', color: isActive ? l.color : 'var(--text-3)', border: `1px solid ${isActive ? l.color + '40' : 'var(--border)'}`, transition: 'all 200ms' }}>
                    {l.icon} {l.label}
                  </span>
                )
              })}
            </div>
          </div>
          <span style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 700, background: 'rgba(212,175,55,0.12)', color: '#b89428', border: '1px solid rgba(212,175,55,0.3)' }}>
            {info.posture?.label ?? 'STRATEGIC PRIORITY'}
          </span>
        </div>

        <div className="account-brief-layout" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 16, alignItems: 'start' }}>
          <div className="account-brief-rail card" style={{ width: 270, minWidth: 270, flexShrink: 0, padding: 0, position: 'sticky', top: 16, boxShadow: 'var(--shadow-xs)', maxHeight: 'calc(100vh - 60px)', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#D4AF37,#b89428)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>✦</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Account Brief</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>AI generated summary</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '4px 0 8px' }}>
              {NAV_LAYERS.map(layer => (
                <LayerNav key={layer.id} layer={layer} active={active} setActive={(sid: string) => { setActive(sid); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
              ))}
            </div>
          </div>

          <div style={{ minWidth: 0 }}>

            <Slide id="nudge">
              <SecHeader title="Account Intelligence" sub={`Triangulated account signals for ${account.name}`} accent="var(--gold)" />
              <NudgeSignalCard text={info.nudgeSignal} />
              <NudgeIntel accountId={id!} accountName={account.name} info={info} />
              <div style={{ marginTop: 20, padding: '20px 22px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>ACCOUNT CONTEXT</div>
                <p style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.8, margin: 0 }}>{info.accountContext}</p>
              </div>
            </Slide>

            <Slide id="one-min">
              <SecHeader title="One Minute Summary" sub={`Everything you need about ${account.name} in under 60 seconds`} accent="var(--gold)" />
              <p style={{ fontSize: 15, color: 'var(--text-3)', marginBottom: 20 }}>Click any card to flip for detail</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 28 }}>
                {(info.oneMinCards ?? []).map((c: any, i: number) => <FlipCard key={i} icon={c.icon} cat={c.cat} front={c.front} sub={c.sub} back={c.back} />)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>EMERGING PRIORITIES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {(info.emergingPriorities ?? []).map((p: string, i: number) => {
                    const impLevels: ('High' | 'Medium' | 'Low')[] = ['High', 'High', 'High', 'Medium', 'Medium', 'Medium', 'Low']
                    const urgLevels: ('High' | 'Medium' | 'Low')[] = ['High', 'High', 'Medium', 'High', 'Medium', 'Low', 'Low']
                    return (
                      <DropdownInsightCard key={i} index={i}
                        title={p.length > 90 ? p.slice(0, 88) + '…' : p}
                        description={p}
                        impact={impLevels[i % 7]}
                        urgency={urgLevels[i % 7]}
                        confidence={['96%', '93%', '90%', '87%', '84%', '81%', '78%'][i % 7]}
                        whyItMatters="This emerging priority signals a near-term buying centre decision or execution mandate. Company should align service line proposals to this priority within the next 60 days."
                        actions={[
                          'Map this priority to a specific Company service line in the account plan',
                          'Identify the executive or team owner driving this initiative',
                          'Build a one-page Company response brief tied to this exact priority',
                        ]}
                      />
                    )
                  })}
                </div>
              </div>
            </Slide>

            <Slide id="org-leadership">
              <SecHeader title="Key Stakeholders" sub="Click any person to expand engagement intelligence, dos/don'ts, and Company selling points" accent="var(--navy)" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {(info.orgLeadership ?? []).map((row: any, i: number) => {
                  const RM: Record<string, { c: string; bg: string }> = { cold: { c: '#1B365D', bg: 'rgba(27,54,93,0.08)' }, warm: { c: '#b89428', bg: 'rgba(212,175,55,0.12)' }, hot: { c: '#dc2626', bg: 'rgba(220,38,38,0.1)' }, active: { c: '#10b981', bg: 'rgba(16,185,129,0.1)' } }
                  const r = RM[(row.relationship || 'cold').toLowerCase()] || RM.cold
                  return (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: r.bg, border: `1px solid ${r.c}22` }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.c }} />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)' }}>{row.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: r.c, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{row.relationship}</span>
                    </span>
                  )
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(info.orgLeadership ?? []).map((row: any, i: number) => <PersonCard key={i} person={row} />)}
              </div>
            </Slide>

            <Slide id="financial">
              <SecHeader title="Financial Snapshot" sub="Click any card to flip for strategic context" accent="var(--gold)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                {(info.financialSnapshot ?? []).map((item: any, i: number) => {
                  const icons = ['💰', '📊', '📈', '🎯', '🏭', '💎', '🌍', '📋']
                  const accents = ['#1B365D', '#b89428', '#0891b2', '#10b981', '#1B365D', '#b89428', '#0891b2', '#10b981']
                  return (
                    <FlipCard key={i} icon={icons[i % 8]} cat={item.label} front={item.value} sub="Click to see strategic context →"
                      back={`${item.label}: ${item.value}. Part of ${account.name}'s tracked financial profile in Company's account intelligence — see Revenue Target and Pipeline Insights for the plan this figure feeds into.`}
                      accentColor={accents[i % 8]} />
                  )
                })}
              </div>
            </Slide>

            <Slide id="revenue-target">
              <SecHeader title="Revenue Target" sub="3-Year revenue model, assumptions and tracking by service line" accent="var(--gold)" />
              {info.revenueTarget && (<>
                <NudgeSignalCard text={info.revenueTarget.nudgeSignal} />
                <CompanyCard text={info.revenueTarget.whatThisMeansForFreyr} />
                <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead><tr style={{ background: 'var(--navy)', color: '#fff' }}>
                      {['Revenue Track', 'FY2026 H2', 'FY2027', 'FY2028', '3-Year Total'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Revenue Track' ? 'left' : 'center', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{(info.revenueTarget.rows ?? []).map((r: any, i: number) => (
                      <tr key={i} style={{ background: r.track.includes('TOTAL') ? 'var(--navy-faint)' : i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-raised)' }}>
                        <td style={{ padding: '10px 16px', color: 'var(--navy)', borderBottom: '1px solid var(--border)', fontWeight: r.track.includes('TOTAL') ? 800 : 600 }}>{r.track}</td>
                        {[r.fy26h2, r.fy27, r.fy28, r.total].map((v: string, j: number) => <td key={j} style={{ padding: '10px 16px', textAlign: 'center', color: r.track.includes('TOTAL') ? 'var(--gold-muted)' : 'var(--text-2)', borderBottom: '1px solid var(--border)', fontWeight: r.track.includes('TOTAL') ? 800 : 500 }}>{v}</td>)}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>MODEL ASSUMPTIONS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {(info.revenueTarget.assumptions ?? []).map((a: string, i: number) => (
                      <DropdownInsightCard key={i} index={i}
                        title={a.length > 70 ? a.slice(0, 68) + '…' : a}
                        description={a}
                        impact={(['High', 'High', 'Medium', 'Medium', 'Low'] as ('High' | 'Medium' | 'Low')[])[i % 5]}
                        urgency={(['High', 'High', 'Medium', 'Medium', 'Low'] as ('High' | 'Medium' | 'Low')[])[i % 5]}
                        confidence={['94%', '88%', '82%', '79%', '65%'][i % 5]}
                        whyItMatters="This assumption underpins the revenue model — achieving it on schedule is critical to the 3-year target."
                      />
                    ))}
                  </div>
                </div>
              </>)}
            </Slide>

            <Slide id="strategic">
              <SecHeader title="Strategic Priorities" sub="Board-level imperatives — click any priority to expand full detail, Company action, and Company signals" accent="var(--gold)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(info.strategicPriorities ?? []).map((item: any, i: number) => <StratCard key={i} item={item} index={i} setActive={setActive} />)}
              </div>
            </Slide>

            <Slide id="right-to-win">
              <SecHeader title="Right to Win" sub="Competitive positioning and differentiators — click to expand each advantage" accent="var(--navy)" />
              {info.rightToWin && (<>
                <NudgeSignalCard text={info.rightToWin.nudgeSignal} />
                <CompanyCard text={info.rightToWin.whatThisMeansForFreyr} />
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>COMPANY'S COMPETITIVE ADVANTAGES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
                  {(info.rightToWin.advantages ?? []).map((adv: any, i: number) => (
                    <DropdownInsightCard key={i} index={i}
                      title={adv.title}
                      description={adv.body}
                      impact={(['High', 'High', 'High', 'Medium', 'Medium', 'High'] as ('High' | 'Medium' | 'Low')[])[i % 6]}
                      urgency={(['High', 'Medium', 'High', 'Medium', 'Low', 'Medium'] as ('High' | 'Medium' | 'Low')[])[i % 6]}
                      confidence={['97%', '94%', '91%', '88%', '85%', '92%'][i % 6]}
                      whyItMatters="This competitive advantage positions Company uniquely against alternatives and is a key reason the account should select Company over incumbents."
                      actions={[
                        `Lead with ${adv.title} in executive-level conversations`,
                        'Prepare a competitive battlecard highlighting this specific advantage',
                        'Quantify ROI impact for the account governance model',
                      ]}
                    />
                  ))}
                </div>
                {info.rightToWin.competitiveGrid && (<>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>COMPETITIVE HEAT GRID</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead><tr style={{ background: 'var(--navy)', color: '#fff' }}>
                        {['Area / Capability', 'Company', 'ICON / Parexel / Accenture', 'Veeva', 'Other'].map(h => <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11, letterSpacing: '0.06em' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>{info.rightToWin.competitiveGrid.map((row: any, i: number) => {
                        const gc = (v: string) => { if (!v || v === 'None' || v === 'Variable') return { bg: '#f8f9fa', c: '#9ca3af' }; if (/Present/.test(v)) return { bg: 'rgba(220,38,38,0.07)', c: '#dc2626' }; if (/Active|Established/.test(v)) return { bg: 'rgba(16,185,129,0.1)', c: '#10b981' }; return { bg: 'rgba(217,119,6,0.08)', c: '#d97706' } }
                        return <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-raised)' }}>
                          <td style={{ padding: '9px 14px', color: 'var(--navy)', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{row.area}</td>
                          {[row.freyr, row.iconParexel, row.veeva, row.other].map((v: string, j: number) => { const c = gc(v); return <td key={j} style={{ padding: '9px 14px', borderBottom: '1px solid var(--border)' }}><span style={{ padding: '3px 9px', borderRadius: 5, background: c.bg, color: c.c, fontSize: 11.5, fontWeight: 600 }}>{v || 'None'}</span></td> })}
                        </tr>
                      })}</tbody>
                    </table>
                  </div>
                </>)}
              </>)}
            </Slide>

            <Slide id="next-action">
              <SecHeader title="Next Best Action" sub="Prioritised engagement actions — click to expand owner, urgency, and full detail" accent="var(--navy)" />
              {(info.nextBestAction ?? []).map((item: any, i: number) => <NBACard key={i} item={item} index={i} />)}
            </Slide>

            <Slide id="90day-plan">
              <SecHeader title="90-Day Action Plan" sub="Week-by-week roadmap with owners, timelines and success metrics" accent="var(--gold)" />
              {info.actionPlan90Day && (<>
                <NudgeSignalCard text={info.actionPlan90Day.nudgeSignal} />
                <CompanyCard text={info.actionPlan90Day.whatThisMeansForFreyr} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
                  {(info.actionPlan90Day.steps ?? []).map((step: any, i: number) => (
                    <InsightCard key={i} index={i} title={step.action} body={step.detail}
                      badge={step.weeks ? `Weeks ${step.weeks}` : undefined} badgeColor="var(--navy)" accent="var(--gold)"
                      extra={
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div style={{ padding: '8px 12px', background: 'var(--navy-faint)', borderRadius: 8 }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>OWNER</div>
                            <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{step.owner}</div>
                          </div>
                          <div style={{ padding: '8px 12px', background: 'rgba(16,185,129,0.07)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>SUCCESS METRIC</div>
                            <div style={{ fontSize: 12.5, color: '#065f46', lineHeight: 1.45 }}>{step.metric}</div>
                          </div>
                        </div>
                      }
                    />
                  ))}
                </div>
                {info.actionPlan90Day.successCriteria && (
                  <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '18px 22px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>90-DAY SUCCESS CRITERIA</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(info.actionPlan90Day.successCriteria ?? []).map((c: string, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>)}
            </Slide>

            <Slide id="big-bets">
              <SecHeader title="Big Bets" sub="High-priority opportunities — click to expand full facts, Company response, and Company signals" accent="var(--gold)" />
              {(info.bigBets ?? []).map((bet: any, i: number) => {
                const c = ['var(--navy)', 'var(--gold-muted)', '#0891b2', '#10b981'][i % 4]
                return <BigBetCard key={i} bet={bet} index={i} accent={c} />
              })}
            </Slide>

            <Slide id="pipeline">
              <SecHeader title="Pipeline Insights" sub="Asset lifecycle, revenue projections, technology pipeline, and growth services" accent="var(--navy)" />
              <PipelineSection info={info} />
            </Slide>

            <Slide id="investment">
              <SecHeader title="Investment Strategy" sub="How Company should sequence entry and expansion at this account" accent="var(--navy)" />
              <div style={{ padding: '18px 22px', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24, borderLeft: '4px solid var(--gold)' }}>
                <p style={{ fontSize: 15.5, color: 'var(--text-2)', lineHeight: 1.9, margin: 0 }}>{info.investmentStrategy}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>
                {(info.bigBets ?? []).slice(0, 3).map((b: any, i: number) => (
                  <FlipCard key={i} icon="💎" cat={`Priority ${i + 1}`} front={b.title} sub={b.tag ?? b.timeline ?? ''} back={b.body} accentColor={['#1B365D', '#2e5a96', '#D4AF37'][i % 3]} />
                ))}
              </div>
            </Slide>

            <Slide id="play-areas">
              <SecHeader title="Play Areas" sub="Core Services, Growth Services, Technology, and Geographies" accent="var(--navy)" />
              {info.playAreas && (<>
                <NudgeSignalCard text={info.playAreas.nudgeSignal} />
                <CompanyCard text={info.playAreas.whatThisMeansForFreyr} />
                {[{ l: '5.1 Core Services', d: info.playAreas.coreServices }, { l: '5.2 Growth Services', d: info.playAreas.growthServices }].map(({ l, d }) => d && (
                  <div key={l} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 14 }}>{l}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {d.map((r: any, i: number) => (
                        <DropdownInsightCard key={i} index={i}
                          title={r.service}
                          description={r.opportunity}
                          impact={/URGENT|MOST|HIGH|ACTIVE/i.test(r.priority) ? 'High' : /MEDIUM/i.test(r.priority) ? 'Medium' : 'Low'}
                          urgency={/URGENT|MOST/i.test(r.priority) ? 'High' : /HIGH|ACTIVE/i.test(r.priority) ? 'Medium' : 'Low'}
                          confidence={['96%', '93%', '90%', '87%', '84%', '80%'][i % 6]}
                          meta={<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: /URGENT|MOST/i.test(r.priority) ? 'rgba(220,38,38,0.1)' : /HIGH|ACTIVE/i.test(r.priority) ? 'rgba(217,119,6,0.1)' : 'rgba(27,54,93,0.08)', color: /URGENT|MOST/i.test(r.priority) ? '#dc2626' : /HIGH|ACTIVE/i.test(r.priority) ? '#d97706' : 'var(--navy)' }}>{r.priority}</span>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#059669' }}>{r.revenue}</span>
                          </div>}
                          whyItMatters={`${r.service} represents a ${/URGENT|MOST/i.test(r.priority) ? 'critical, immediate' : /HIGH|ACTIVE/i.test(r.priority) ? 'high-value, near-term' : 'future'} revenue opportunity.`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {info.playAreas.technologyTrack && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 14 }}>5.3 Technology Track</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {info.playAreas.technologyTrack.map((t: any, i: number) => (
                        <DropdownInsightCard key={i} index={i}
                          title={t.platform}
                          description={t.entryPath}
                          impact={/NEAR/i.test(t.stage) ? 'High' : 'Medium'}
                          urgency={/NEAR/i.test(t.stage) ? 'High' : 'Medium'}
                          confidence={['94%', '91%', '88%', '72%'][i % 4]}
                          meta={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: /NEAR/i.test(t.stage) ? 'rgba(16,185,129,0.1)' : 'rgba(27,54,93,0.08)', color: /NEAR/i.test(t.stage) ? '#10b981' : 'var(--navy)' }}>{t.stage}</span>
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(8,145,178,0.1)', color: '#0891b2' }}>{t.revenue}</span>
                          </div>}
                          whyItMatters={`${t.platform} is a technology entry point that creates long-term account stickiness.`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {info.playAreas.geographies && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'Playfair Display,serif', marginBottom: 12 }}>5.4 Geographies</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {info.playAreas.geographies.map((g: any, i: number) => (
                        <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 14.5, fontWeight: 700, color: 'var(--navy)' }}>{g.geo}</div>
                            <span style={{ padding: '2px 9px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: /PRIMARY|URGENT/i.test(g.priority) ? 'rgba(16,185,129,0.08)' : /HIGH/i.test(g.priority) ? 'rgba(217,119,6,0.08)' : 'rgba(27,54,93,0.08)', color: /PRIMARY/i.test(g.priority) ? '#10b981' : /URGENT/i.test(g.priority) ? '#dc2626' : /HIGH/i.test(g.priority) ? '#d97706' : 'var(--navy)', whiteSpace: 'nowrap' }}>{g.priority}</span>
                          </div>
                          <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 8px' }}>{g.programme}</p>
                          <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11.5, color: 'var(--gold-muted)', fontWeight: 600, background: 'var(--gold-light)' }}>{g.services}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>)}
            </Slide>

            <Slide id="freyr-play">
              <SecHeader title="Company Opportunity Fit" sub="Service line matching, competitive scores, and engagement strategy" accent="var(--gold)" />
              {(info.freyrPlays ?? []).length > 0 && (
                <div style={{ padding: '16px 20px', background: 'var(--navy-faint)', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>PLAY LIST</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
                    {info.freyrPlays.map((p: string, i: number) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rightToWinPlays.map((play: any, i: number) => <PlayFitCard key={i} play={play} />)}
              </div>
            </Slide>

            <Slide id="swot">
              <SecHeader title="SWOT Analysis" sub="Click any card to expand Strengths, Weaknesses, Opportunities and Threats" accent="var(--gold)" />
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>Click any card to flip for detail</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                {[
                  { label: 'Strengths', key: 'S', icon: '💪', accent: '#10b981', frontSub: 'Internal advantages Company holds at this account' },
                  { label: 'Weaknesses', key: 'W', icon: '⚠️', accent: '#dc2626', frontSub: 'Internal gaps that must be closed' },
                  { label: 'Opportunities', key: 'O', icon: '🚀', accent: '#b89428', frontSub: 'External openings Company can exploit now' },
                  { label: 'Threats', key: 'T', icon: '🛡️', accent: '#1B365D', frontSub: 'External risks that could shut Company out' },
                ].map(({ label, key, icon, accent, frontSub }) => {
                  const items: string[] = (info.swot as any)?.[key] || []
                  return <FlipCard key={key} icon={icon} cat={label} front={`${items.length} ${label}`} sub={frontSub} back={items.map((t, i) => `${i + 1}. ${t}`).join('\n\n')} accentColor={accent} />
                })}
              </div>
            </Slide>

            <Slide id="news">
              <SecHeader title="News Intelligence" sub="Internal company updates and external industry developments" accent="var(--navy)" />
              <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
                {(['internal', 'external'] as const).map(t => (
                  <button key={t} onClick={() => setNewsTab(t)} style={{ padding: '10px 18px', background: 'none', border: 'none', borderBottom: newsTab === t ? '2px solid var(--navy)' : '2px solid transparent', marginBottom: -2, cursor: 'pointer', fontSize: 14, fontWeight: newsTab === t ? 700 : 400, color: newsTab === t ? 'var(--navy)' : 'var(--text-3)', transition: 'all 160ms' }}>
                    {t === 'internal' ? 'Company Internal News' : 'Industry & Account News'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {news.map((item: any) => (
                  <div key={item.id} onClick={() => setSelectedArticle(item)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(27,54,93,0.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{item.date}</div>
                    <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 14.5, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.35, marginBottom: 8 }}>{item.title}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55, margin: 0 }}>{item.body.slice(0, 140)}...</p>
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gold-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Read full story <ChevronRight size={11} /></div>
                  </div>
                ))}
              </div>
              {selectedArticle && <NewsModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
            </Slide>

            <Slide id="notes">
              <SecHeader title="Notes & Download" sub="Account-level notes and full intelligence dossier export" accent="var(--gold)" />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>ACCOUNT NOTES</div>
                  <textarea placeholder="Add notes about this account..." value={notes} onChange={e => setNotes(e.target.value)} rows={7}
                    style={{ marginBottom: 12, fontSize: 14.5, width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-1)', fontFamily: 'inherit', resize: 'vertical' }} />
                  <button className="btn btn-navy" style={{ fontSize: 13, padding: '8px 18px' }} onClick={() => {
                    localStorage.setItem(`nudge_notes_${id}`, notes)
                    alert('Notes saved.')
                  }}>Save Notes</button>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>ACCOUNT INTELLIGENCE DOSSIER</div>
                  <div style={{ padding: 22, background: 'var(--navy-faint)', borderRadius: 14, border: '1px solid rgba(27,54,93,0.14)', textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22 }}>📥</div>
                    <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Account Intelligence Dossier</div>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 18, lineHeight: 1.55 }}>Download the complete account intelligence — Company Signal, Strategic Priorities, Big Bets, Stakeholders, Financial Snapshot, SWOT, Pipeline, Play Areas, Next Best Actions and more.</p>
                    <button className="btn btn-navy" style={{ width: '100%', justifyContent: 'center', gap: 8, fontSize: 13 }} onClick={() => {
                      const html = generateAccountDossierHtml(info)
                      const blob = new Blob([html], { type: 'text/html' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${(info.name || id || 'account').replace(/[^a-zA-Z0-9]/g, '-')}-Intelligence-Dossier.html`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}>
                      <ArrowRight size={14} /> Download Dossier
                    </button>
                  </div>
                </div>
              </div>
            </Slide>

          </div>
        </div>
      </div>
    </Ctx.Provider>
  )
}

// ─── OPPORTUNITY FIT CARD (Company Opportunities slide) ─────────────────────
function PlayFitCard({ play }: { play: any }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', background: open ? 'var(--bg-raised)' : 'transparent' }} onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${play.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{play.icon || '💡'}</div>
          <div>
            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{play.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{play.subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Playfair Display,serif', fontSize: 20, fontWeight: 700, color: play.color }}>{play.score}%</span>
          <ChevronDown size={14} style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
        </div>
      </div>
      {open && (
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)', animation: 'pageIn 200ms ease' }}>
          <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${play.score}%`, background: `linear-gradient(90deg,${play.color},${play.color}88)`, borderRadius: 3, transition: 'width 600ms ease' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {(play.details ?? []).map((d: any, j: number) => (
              <div key={j} style={{ padding: '10px 14px', background: 'var(--bg-raised)', borderRadius: 9, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{d.value}</div>
              </div>
            ))}
          </div>
          <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(play.bullets ?? []).map((b: string, j: number) => (
              <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: play.color, flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7 }}>{b}</span>
              </li>
            ))}
          </ul>
          <div style={{ padding: '12px 16px', background: 'rgba(212,175,55,0.07)', border: '1.5px solid rgba(212,175,55,0.25)', borderRadius: 9 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#b89428', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>COMPANY IMPLICATION</div>
            <p style={{ fontSize: 13.5, color: '#7a5c00', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{play.implication}</p>
          </div>
        </div>
      )}
    </div>
  )
}
