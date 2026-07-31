import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/** Service Line selector shown top-right of module tab bars (spec §5). */
export default function ServiceLineSelector({
  options, value, onChange, allLabel = 'All service lines', label = 'SERVICE LINE',
}: {
  options: { id: string; label: string }[]
  value: string | null
  onChange: (v: string | null) => void
  allLabel?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const current = value ? options.find(o => o.id === value)?.label ?? allLabel : allLabel
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className="eyebrow" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-3)' }}>{label}</span>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8,
          border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', color: 'var(--text-2)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 160, justifyContent: 'space-between' }}>
        {current}
        <ChevronDown size={14} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-md)', zIndex: 50, minWidth: 200, padding: 6 }}>
          {[{ id: '__all__', label: allLabel }, ...options].map(o => {
            const selected = (o.id === '__all__' && !value) || o.id === value
            return (
              <button key={o.id} onClick={() => { onChange(o.id === '__all__' ? null : o.id); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  padding: '8px 10px', borderRadius: 7, border: 'none', background: selected ? 'var(--navy-faint)' : 'transparent',
                  color: 'var(--text-1)', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                {o.label}{selected && <Check size={14} style={{ color: 'var(--navy)' }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
