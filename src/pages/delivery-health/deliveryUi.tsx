// ─── DELIVERY MODULE SHARED UI HELPERS ────────────────────────────────────────
// Small primitives + adapters that render the platform's Engagement seed in the
// production reference's visual language (nudge-delivery-module_latest.html).

import { TrendingUp, Shield, Sparkles, Clock, Building2, type LucideIcon } from 'lucide-react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import {
  type Engagement, type EngagementSignal, type SignalFamily,
  SIGNAL_FAMILY_LABEL, ragOf, signalRag, ragLabel, type Rag,
} from '../../data/delivery.seed'
import { serviceLineLabel } from '../../data/shared'

export const DELIVERY_TABS = [
  { label: 'Dashboard', path: '/delivery-health' },
  { label: 'Projects', path: '/delivery-health/projects' },
  { label: 'Account Health', path: '/delivery-health/accounts' },
  { label: 'Interventions', path: '/delivery-health/actions' },
]

/** Module-level tab bar — shared platform style (navy text + gold underline). */
export function DeliveryTabs() {
  return <ModuleTabBar tabs={DELIVERY_TABS} />
}

// ─── RAG dot / badge / pills ──────────────────────────────────────────────────
export function DhRagDot({ rag }: { rag: Rag }) {
  return <span className={`rag-dot rag-${rag}`} />
}
export function DhRagBadge({ rag }: { rag: Rag }) {
  return <span className={`badge badge-${rag === 'red' ? 'red' : rag === 'amber' ? 'amber' : 'green'}`}>{ragLabel(rag)}</span>
}
export function DhConfidence({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const cls = level === 'High' ? 'pill-confidence-high' : level === 'Low' ? 'pill-confidence-low' : 'pill-confidence-medium'
  return <span className={`pill ${cls}`}>Confidence: {level}</span>
}

// ─── family metadata ──────────────────────────────────────────────────────────
export const FAMILY_ICON: Record<SignalFamily, LucideIcon> = {
  DeliveryPerformance: TrendingUp,
  RiskCompliance: Shield,
  CustomerSentiment: Sparkles,
  OperationsData: Clock,
  PeopleData: Building2,
}
export const FAMILY_ORDER: SignalFamily[] = ['DeliveryPerformance', 'RiskCompliance', 'CustomerSentiment', 'OperationsData', 'PeopleData']
export const FAMILY_SHORT: Record<SignalFamily, string> = {
  DeliveryPerformance: 'Delivery',
  RiskCompliance: 'Risk & compl.',
  CustomerSentiment: 'Sentiment',
  OperationsData: 'Operations',
  PeopleData: 'People',
}

// A signal's "source" is derived from its family for the evidence-card receipt.
const FAMILY_SOURCE: Record<SignalFamily, string> = {
  DeliveryPerformance: 'Delivery tracking system',
  RiskCompliance: 'Compliance register',
  CustomerSentiment: 'QBR meeting notes',
  OperationsData: 'Operations analytics',
  PeopleData: 'Resourcing tracker',
}

export interface Metric {
  family: SignalFamily
  name: string
  value: string
  target?: string
  status: Rag
  note: string
  source: string
  confidence: 'High' | 'Medium' | 'Low'
  trend?: [Rag, Rag, Rag]
}

function fmtValue(s: EngagementSignal): string {
  if (s.current_value == null) return '—'
  if (s.unit === '%') return `${s.current_value}%`
  return `${s.current_value}${s.unit ? ` ${s.unit}` : ''}`
}
function fmtTarget(s: EngagementSignal): string | undefined {
  if (s.target_value == null) return undefined
  return `${s.target_value}${s.unit === '%' ? '%' : s.unit ? ` ${s.unit}` : ''} target`
}

export function signalToMetric(s: EngagementSignal): Metric {
  const status = signalRag(s.trend)
  return {
    family: s.family,
    name: s.label,
    value: fmtValue(s),
    target: fmtTarget(s),
    status,
    note: s.narrative,
    source: FAMILY_SOURCE[s.family],
    confidence: status === 'red' ? 'High' : status === 'amber' ? 'Medium' : 'High',
    trend: [ragOf(s.trend[0]), ragOf(s.trend[1]), ragOf(s.trend[2])],
  }
}

export function groupByFamily(e: Engagement): { family: SignalFamily; metrics: Metric[] }[] {
  return FAMILY_ORDER
    .map(family => ({ family, metrics: e.signals.filter(s => s.family === family).map(signalToMetric) }))
    .filter(g => g.metrics.length > 0)
}

export const allMetrics = (e: Engagement): Metric[] => e.signals.map(signalToMetric)
export const projectRag = (e: Engagement): Rag => ragOf(e.rag_status)
export const familyLabel = (f: SignalFamily) => SIGNAL_FAMILY_LABEL[f]
export const slLabel = (id: string) => serviceLineLabel(id)

// ─── RAG-logic info popover (reference `ragLogicPanel`) ───────────────────────
import { useState } from 'react'
import { Info } from 'lucide-react'
export function RagLogicInfo() {
  const [open, setOpen] = useState(false)
  return (
    <span className="info-wrap" onMouseLeave={() => setOpen(false)}>
      <button className={`info-btn${open ? ' active' : ''}`} onClick={e => { e.stopPropagation(); setOpen(o => !o) }} aria-label="How is this calculated?">
        <Info size={12} />
      </button>
      {open && (
        <div className="info-panel" role="region">
          <p className="t-secondary" style={{ margin: 0 }}>Every signal metric is checked against its target and classified Green, Amber, or Red. A project's overall status is set automatically:</p>
          <ul>
            <li><b style={{ color: 'var(--dh-status-red)' }}>Critical</b> — two or more Red signals, or one Red signal alongside high business impact on revenue, compliance, or reputation.</li>
            <li><b style={{ color: 'var(--dh-status-amber)' }}>Needs attention</b> — one Red signal without high impact, or any Amber signal present.</li>
            <li><b style={{ color: 'var(--dh-status-green)' }}>Stable</b> — every tracked signal is on or above target.</li>
          </ul>
          <p className="t-secondary" style={{ margin: '8px 0 0' }}>Status recalculates automatically as new data arrives — no manual override.</p>
        </div>
      )}
    </span>
  )
}
