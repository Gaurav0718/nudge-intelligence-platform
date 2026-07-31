// ─── SHARED UI PRIMITIVES ─────────────────────────────────────────────────────
// Card / Badge / Pill / RagDot / AvatarInitials / AccentCallout /
// ExpandableInsightCard / SectionHeading / EmptyState / MetricStat — master §4.3.

import { useState, type ReactNode, type CSSProperties } from 'react'
import { ChevronDown } from 'lucide-react'

export type RagStatus = 'Critical' | 'NeedsAttention' | 'Stable'

export function Card({ children, style, className = '', onClick, clickable }: {
  children: ReactNode; style?: CSSProperties; className?: string; onClick?: () => void; clickable?: boolean
}) {
  return (
    <div className={`card${clickable ? ' card-clickable' : ''} ${className}`} onClick={onClick} style={{ padding: 20, ...style }}>
      {children}
    </div>
  )
}

type BadgeColor = 'emerald' | 'amber' | 'red' | 'blue' | 'teal' | 'navy' | 'gold'
export function Badge({ children, color = 'navy', style }: { children: ReactNode; color?: BadgeColor; style?: CSSProperties }) {
  return <span className={`badge badge-${color}`} style={style}>{children}</span>
}

export function Pill({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return <button className={`pill-filter${active ? ' active' : ''}`} onClick={onClick}>{children}</button>
}

export function RagDot({ status, size = 10 }: { status: RagStatus; size?: number }) {
  const cls = status === 'Critical' ? 'critical' : status === 'NeedsAttention' ? 'attention' : 'stable'
  return <span className={`rag-dot ${cls}`} style={{ width: size, height: size }} />
}

export const RAG_META: Record<RagStatus, { label: string; color: string; bg: string; badge: BadgeColor }> = {
  Critical:       { label: 'Critical',        color: 'var(--red)',     bg: 'var(--red-bg)',     badge: 'red' },
  NeedsAttention: { label: 'Needs attention', color: 'var(--amber)',   bg: 'var(--amber-bg)',   badge: 'amber' },
  Stable:         { label: 'Stable',          color: 'var(--emerald)', bg: 'var(--emerald-bg)', badge: 'emerald' },
}

export function AvatarInitials({ text, color = 'var(--navy)', size = 40, gold }: {
  text: string; color?: string; size?: number; gold?: boolean
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 44 ? 14 : '50%', flexShrink: 0,
      background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, letterSpacing: '0.02em',
      border: gold ? '2px solid var(--gold)' : 'none',
    }}>
      {text.slice(0, 2).toUpperCase()}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, sub, right }: {
  eyebrow?: string; title: string; sub?: string; right?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
      <div>
        {eyebrow && <p className="eyebrow" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>{eyebrow}</p>}
        <h1 style={{ fontSize: 26, color: 'var(--text-1)', lineHeight: 1.15 }}>{title}</h1>
        {sub && <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6, maxWidth: 720 }}>{sub}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}

export function AccentCallout({ label, children, tone = 'gold', icon }: {
  label?: string; children: ReactNode; tone?: 'gold' | 'navy' | 'red' | 'emerald'; icon?: ReactNode
}) {
  const map = {
    gold:    { bg: 'var(--gold-light)', border: 'var(--gold)',    text: 'var(--gold-muted)' },
    navy:    { bg: 'var(--navy-faint)', border: 'var(--navy)',    text: 'var(--navy)' },
    red:     { bg: 'var(--red-bg)',     border: 'var(--red)',     text: '#b91c1c' },
    emerald: { bg: 'var(--emerald-bg)', border: 'var(--emerald)', text: '#047857' },
  }[tone]
  return (
    <div style={{ background: map.bg, borderLeft: `3px solid ${map.border}`, borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
      {label && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: map.text, marginBottom: 5 }}>{icon}{label}</div>}
      <div style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}

export function ExpandableInsightCard({ title, badge, defaultOpen = false, children, meta, headerClassName = '' }: {
  title: ReactNode; badge?: ReactNode; defaultOpen?: boolean; children: ReactNode; meta?: ReactNode; headerClassName?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} className={headerClassName} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: open ? '12px 12px 0 0' : 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{title}</div>
          {meta && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3 }}>{meta}</div>}
        </div>
        {badge}
        <ChevronDown size={17} style={{ color: 'var(--text-3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', flexShrink: 0 }} />
      </button>
      {open && <div style={{ padding: '4px 20px 20px', borderTop: '1px solid var(--border)' }}>{children}</div>}
    </div>
  )
}

export function MetricStat({ label, value, sub, color = 'var(--navy)' }: {
  label: string; value: ReactNode; sub?: string; color?: string
}) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, sub }: { icon?: ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
      {icon && <div style={{ marginBottom: 12, opacity: 0.5, display: 'flex', justifyContent: 'center' }}>{icon}</div>}
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>{sub}</div>}
    </div>
  )
}

export function ConfidencePill({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const color = level === 'High' ? 'emerald' : level === 'Medium' ? 'amber' : 'red'
  return <Badge color={color as BadgeColor}>{level} confidence</Badge>
}
