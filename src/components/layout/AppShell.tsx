import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles, Home } from 'lucide-react'
import Sidebar from './Sidebar'
import ModuleTabBar from '../shared/ModuleTabBar'
import { GROWTH_TABS } from '../../pages/growth/growthTabs'

// The Sales & Growth module spans the Executive Summary (news) pages and the
// account sections (Account Info / Exec Capital / Account Planning). Show the
// shared 5-section tab bar across all of them.
function isGrowthModule(p: string) {
  // Consolidated Account Report + consolidated view are Accounts-only — not Sales & Growth,
  // so they must NOT show the Sales & Growth 5-section tab bar.
  if (p.endsWith('/report') || p.endsWith('/consolidated')) return false
  return p.startsWith('/executive-summary') || p === '/accounts' || p.startsWith('/accounts/')
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/modules': 'Modules',
  '/executive-summary': 'Sales & Growth — Internal News',
  '/executive-summary/external-news': 'Sales & Growth — External News',
  '/executive-summary/pipeline-insights': 'Pipeline Insights',
  '/executive-summary/financial-insights': 'Financial Insights',
  '/competition': 'Competition Intelligence',
  '/competition/signals': 'Signal Feed',
  '/competition/radar': 'Strategic Radar',
  '/delivery-health': 'Delivery Health',
  '/delivery-health/projects': 'Projects',
  '/delivery-health/accounts': 'Account Health',
  '/delivery-health/actions': 'Interventions',
  '/marketing': 'Marketing & Service Line',
  '/marketing/market-pulse': 'Market Pulse',
  '/marketing/inside-indegene': 'Inside Company',
  '/marketing/account-pulse': 'Account Pulse',
  '/marketing/next-best-action': 'Next Best Action',
  '/marketing/execution-workspace': 'Execution Workspace',
  '/accounts': 'Account Intelligence',
  '/accounts/planning': 'Account Planning',
  '/accounts/exec-capital': 'Exec Capital',
}
function getTitle(p: string) {
  if (PAGE_TITLES[p]) return PAGE_TITLES[p]
  if (p.startsWith('/competition/')) return 'Competition Intelligence'
  if (p.startsWith('/delivery-health/engagement/')) return 'Project Detail'
  if (p.startsWith('/delivery-health/')) return 'Delivery Health'
  if (p.startsWith('/executive-summary/')) return 'Sales & Growth Intelligence'
  if (p.startsWith('/marketing/')) return 'Marketing & Service Line'
  if (p.startsWith('/accounts/exec-capital/')) return 'Exec Capital'
  if (p.startsWith('/accounts/')) return 'Account Intelligence'
  return 'The Company Intelligence'
}

export default function AppShell() {
  const loc = useLocation()
  const nav = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className={`sidebar${sidebarOpen ? '' : ' hidden'}`}>
        <Sidebar />
      </div>

      <div className={`main-area${sidebarOpen ? '' : ' sidebar-hidden'}`}
        style={{ marginLeft: sidebarOpen ? 'var(--sb-w)' : 0, flex: 1, minWidth: 0 }}>
        <header className="topbar">
          <button onClick={() => setSidebarOpen(s => !s)}
            style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 180ms', flexShrink: 0 }}>
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
          <button onClick={() => nav('/')} title="Home" aria-label="Home"
            style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)', transition: 'all 180ms', flexShrink: 0 }}>
            <Home size={15} />
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)' }}>{getTitle(loc.pathname)}</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => nav('/')} style={{ fontSize: 13, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            {loc.pathname === '/'
              ? <span style={{ color: 'var(--navy)', fontWeight: 600 }}>Home</span>
              : <><span style={{ color: 'var(--navy)', fontWeight: 600 }}>Home</span> / {getTitle(loc.pathname)}</>}
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0, border: '2px solid var(--gold)' }}>RD</div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' }}>Ritesh Dogra</span>
        </header>

        <main className="page-enter" style={{ padding: '24px 28px 48px', background: 'var(--bg-base)', minHeight: 'calc(100vh - var(--topbar-h))', flex: 1 }}>
          {isGrowthModule(loc.pathname) && <ModuleTabBar tabs={GROWTH_TABS} />}
          <Outlet />
        </main>
      </div>

      {/* Global floating AI-assistant launcher — decorative stub (master §5) */}
      <button className="fab-ai" title="AI assistant (coming soon)" aria-label="AI assistant">
        <Sparkles size={22} />
      </button>
    </div>
  )
}
