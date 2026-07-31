import { useNavigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export interface ModuleTab { label: string; path: string; end?: boolean }

/** Shared page-level tab bar (navy active + gold underline). Optional right-slot. */
export default function ModuleTabBar({ tabs, right }: { tabs: ModuleTab[]; right?: ReactNode }) {
  const nav = useNavigate()
  const loc = useLocation()
  const matches = (t: ModuleTab) => loc.pathname === t.path || loc.pathname.startsWith(t.path + '/')
  const activePath = tabs.filter(matches).sort((a, b) => b.path.length - a.path.length)[0]?.path
  return (
    <div className="module-tabbar" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {tabs.map(t => (
          <button key={t.path} className={`module-tab${t.path === activePath ? ' active' : ''}`} onClick={() => nav(t.path)}>
            {t.label}
          </button>
        ))}
      </div>
      {right && <div style={{ paddingBottom: 6 }}>{right}</div>}
    </div>
  )
}
