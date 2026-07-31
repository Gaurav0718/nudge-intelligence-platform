// ─── TIME-WINDOWED ORG INTELLIGENCE ────────────────────────────────────────────
// Anchored to the most recent dated evidence in the dataset (not wall-clock
// "now" — the research is a point-in-time snapshot, so "24 hours ago" only
// means something relative to the data's own most recent date). Undated
// evidence always passes every window: there's no honest way to bucket it,
// and hiding a High-urgency item just because it lacks a source date would be
// misleading, not more precise.

import type { OrganizationIntelligence } from './orgIntelligence'

export type TimeWindowKey = 'all' | '24h' | '7d' | '30d' | 'quarter'
export const TIME_WINDOWS: { key: TimeWindowKey; label: string; days: number | null }[] = [
  { key: 'all', label: 'All time', days: null },
  { key: '24h', label: 'Last 24 hours', days: 1 },
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: 'quarter', label: 'Last quarter', days: 90 },
]

export function computeAnchorDate(data: OrganizationIntelligence): string | null {
  let max: string | null = null
  for (const item of Object.values(data.evidenceById)) {
    if (item.dateISO && (!max || item.dateISO > max)) max = item.dateISO
  }
  return max
}

export function withinWindow(dateISO: string | null | undefined, anchor: string | null, windowKey: TimeWindowKey): boolean {
  if (windowKey === 'all') return true
  if (!dateISO) return true // undated evidence is never hidden by a time window — see file header
  if (!anchor) return true
  const days = TIME_WINDOWS.find(w => w.key === windowKey)?.days
  if (days == null) return true
  const anchorMs = new Date(anchor).getTime()
  const itemMs = new Date(dateISO).getTime()
  if (Number.isNaN(anchorMs) || Number.isNaN(itemMs)) return true
  const diffDays = (anchorMs - itemMs) / 86_400_000
  return diffDays >= 0 && diffDays <= days
}
