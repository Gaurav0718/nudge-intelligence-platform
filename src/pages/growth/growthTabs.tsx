import type { ModuleTab } from '../../components/shared/ModuleTabBar'

// The Sales & Growth module's five sections.
export const GROWTH_TABS: ModuleTab[] = [
  { label: 'Internal News',    path: '/executive-summary' },
  { label: 'External News',    path: '/executive-summary/external-news' },
  { label: 'Account Info',     path: '/accounts' },
  { label: 'Exec Capital',     path: '/accounts/exec-capital' },
  { label: 'Account Planning', path: '/accounts/planning' },
]
