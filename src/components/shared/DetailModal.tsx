import { ReactNode, useEffect } from 'react'
import { X, ArrowLeft, ExternalLink } from 'lucide-react'

/** Reusable on-screen detail popup: gold-topped panel, close (X) + Back, optional source link. */
export default function DetailModal({
  eyebrow, title, badges, children, onClose, sourceLabel, sourceUrl,
}: {
  eyebrow?: string
  title: string
  badges?: ReactNode
  children: ReactNode
  onClose: () => void
  sourceLabel?: string
  sourceUrl?: string
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,26,46,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, padding: '48px 20px', overflowY: 'auto', animation: 'fadeIn 140ms ease' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 720, maxWidth: '94vw', background: 'var(--bg-surface)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 80px rgba(13,26,46,0.4)', borderTop: '5px solid var(--gold)', animation: 'popIn 180ms cubic-bezier(0.34,1.56,0.64,1)' }}>
        {/* Header */}
        <div style={{ padding: '20px 26px 16px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button onClick={onClose} aria-label="Close"
            style={{ position: 'absolute', top: 16, right: 18, background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-3)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={17} />
          </button>
          {eyebrow && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>{eyebrow}</div>}
          <h2 style={{ fontSize: 21, fontWeight: 700, color: 'var(--text-1)', margin: 0, lineHeight: 1.3, paddingRight: 40, fontFamily: 'Playfair Display, Georgia, serif' }}>{title}</h2>
          {badges && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{badges}</div>}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 26px', maxHeight: '62vh', overflowY: 'auto' }}>{children}</div>

        {/* Footer */}
        <div style={{ padding: '14px 26px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg-raised)' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={15} /> Back
          </button>
          {sourceUrl
            ? <a href={sourceUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>Source: {sourceLabel || 'Reference'} <ExternalLink size={13} /></a>
            : sourceLabel && <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--text-3)' }}>Source: {sourceLabel}</span>}
        </div>
      </div>
    </div>
  )
}

/** Titled section block for use inside a DetailModal body. */
export function ModalSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}
