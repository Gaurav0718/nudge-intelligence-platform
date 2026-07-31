import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface AccountOption { id: string; label: string; color?: string }

/** Compact account picker used throughout HOME. `allowAll` controls whether an
 *  "All accounts combined" row is offered: several bands deliberately omit it. */
export default function AccountSelect({
  options, value, onChange, allowAll = false, allLabel = 'All accounts combined',
}: {
  options: AccountOption[]
  value: string | null
  onChange: (v: string | null) => void
  allowAll?: boolean
  allLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const current = value ? options.find(o => o.id === value): null

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 8,
          border: '1px solid var(--border-strong)', background: 'var(--bg-surface)', color: 'var(--text-2)',
          fontSize: 12.5, fontWeight: 600, cursor: 'pointer', minWidth: 150, justifyContent: 'space-between' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {current?.color && <span style={{ width: 7, height: 7, borderRadius: '50%', background: current.color, flexShrink: 0 }} />}
          {current?.label ?? allLabel}
        </span>
        <ChevronDown size={13} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)': 'none', transition: 'transform 180ms', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-md)', zIndex: 60, minWidth: 190, padding: 6 }}>
          {allowAll && (
            <button onClick={() => { onChange(null); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '7px 10px', borderRadius: 7, border: 'none', background: !value ? 'var(--navy-faint)': 'transparent',
                color: 'var(--text-1)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left' }}>
              {allLabel}{!value && <Check size={13} style={{ color: 'var(--navy)' }} />}
            </button>
          )}
          {options.map(o => (
            <button key={o.id} onClick={() => { onChange(o.id); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '7px 10px', borderRadius: 7, border: 'none', background: o.id === value ? 'var(--navy-faint)': 'transparent',
                color: 'var(--text-1)', fontSize: 12.5, cursor: 'pointer', textAlign: 'left', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                {o.color && <span style={{ width: 7, height: 7, borderRadius: '50%', background: o.color, flexShrink: 0 }} />}{o.label}
              </span>
              {o.id === value && <Check size={13} style={{ color: 'var(--navy)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
