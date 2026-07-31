import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, Building2, ChevronDown, TrendingUp, BarChart3, CheckCircle2, Users, Target, FileText, BookOpen, Home } from 'lucide-react'
import NudgeMark from '../shared/NudgeMark'

const MODULES_SUB = [
  { label: 'Sales & Growth',  path: '/executive-summary', icon: TrendingUp },
  { label: 'Marketing',       path: '/marketing',         icon: BarChart3 },
  { label: 'Delivery Health', path: '/delivery-health',   icon: CheckCircle2 },
  { label: 'Competition',     path: '/competition',       icon: Target },
  { label: 'Talent Internal', path: '#', icon: Users,    soon: true },
  { label: 'RFP/RFI Hub',     path: '#', icon: FileText, soon: true },
]
// Accounts is its own top-level section — the cross-module consolidated hub, not Growth's.
const ACCOUNTS_SUB = [
  { label: 'Account Info',     path: '/accounts',              icon: BookOpen },
  { label: 'Exec Capital',     path: '/accounts/exec-capital', icon: Users },
  { label: 'Account Planning', path: '/accounts/planning',     icon: FileText },
]

export default function Sidebar() {
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState<Record<string, boolean>>({ modules: true, accounts: true })

  const isActive = (path: string) => {
    if (path === '/accounts') return loc.pathname === '/accounts'
    return loc.pathname === path || loc.pathname.startsWith(path + '/')
  }
  const sectionActive = (paths: string[]) => paths.some(p => isActive(p))
  const toggle = (k: string) => setOpen(o => ({ ...o, [k]: !o[k] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      <div onClick={() => nav('/')} style={{
        padding: '16px 16px 14px',
        borderBottom: '1px solid rgba(212,175,55,0.18)',
        cursor: 'pointer', flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(212,175,55,0.04), transparent)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 4 }}>
          <div style={{ fontSize: 8, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase' }}>THE</div>
          <div className="wordmark" style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.0 }}>Company</div>
          <div style={{ fontSize: 7, letterSpacing: '0.26em', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase' }}>INTELLIGENCE</div>
        </div>
        <NudgeMark size={42} style={{ marginLeft: 6 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '14px 0 8px' }}>
        <div style={{ padding: '0 20px 10px', fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)', fontWeight: 600, textTransform: 'uppercase' }}>
          Main Menu
        </div>

        <div style={{ marginBottom: 6 }}>
          <div className={`nav-item${loc.pathname === '/' ? ' active' : ''}`} onClick={() => nav('/')}>
            <Home size={15} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Home</span>
          </div>
        </div>

        <div>
          <div className={`nav-item${sectionActive(['/modules', '/executive-summary', '/competition', '/delivery-health', '/marketing']) ? ' active' : ''}`}
            onClick={() => { toggle('modules'); nav('/modules') }}>
            <LayoutGrid size={15} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Modules</span>
            <ChevronDown size={13} style={{ opacity: 0.5, transform: open.modules ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', flexShrink: 0 }} />
          </div>
          {open.modules && MODULES_SUB.map(item => {
            const Icon = item.icon
            return (
              <div key={item.label} className={`sub-nav-item${!item.soon && isActive(item.path) ? ' active' : ''}`}
                style={{ opacity: item.soon ? 0.4 : 1, cursor: item.soon ? 'default' : 'pointer' }}
                onClick={() => !item.soon && nav(item.path)}>
                <Icon size={12} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
                {item.soon && <span style={{ fontSize: 9, marginLeft: 'auto', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>soon</span>}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 6 }}>
          <div className={`nav-item${isActive('/overview') ? ' active' : ''}`}
            onClick={() => nav('/overview')}>
            <Building2 size={15} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>Accounts</span>
            <span style={{ fontSize: 9, marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>consolidated</span>
          </div>
          {false && ACCOUNTS_SUB.map(item => {
            const Icon = item.icon
            return (
              <div key={item.path} className={`sub-nav-item${isActive(item.path) ? ' active' : ''}`} onClick={() => nav(item.path)}>
                <Icon size={12} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(212,175,55,0.12)', fontSize: 10, color: 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        © 2026 The Company Intelligence
      </div>
    </div>
  )
}
