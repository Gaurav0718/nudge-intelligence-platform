import { useState } from 'react'
import { avatarUrl, initialsOf } from '../../lib/avatars'

// Realistic portrait; falls back to initials chip if offline / image fails.
export default function Avatar({ name, size = 44, radius, bg, style }:
  { name: string; size?: number; radius?: number; bg?: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false)
  const url = avatarUrl(name)
  const r = radius ?? Math.round(size * 0.27)
  const base: React.CSSProperties = { width: size, height: size, borderRadius: r, flexShrink: 0, display: 'block', ...style }
  if (url && !err) {
    return <img src={url} alt={name} onError={() => setErr(true)}
      style={{ ...base, objectFit: 'cover', background: bg || 'var(--navy-faint)' }} />
  }
  return (
    <div style={{ ...base, background: bg || 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: Math.round(size * 0.36) }}>
      {initialsOf(name)}
    </div>
  )
}
