import { useState, type ReactNode } from 'react'
import type { QuarterFacet, MomentumPoint, EvidenceItem } from '../../lib/orgIntelligence'
import type { OpenEvidence } from './homeTypes'

// ─── shared tiny tooltip ────────────────────────────────────────────────────
function Tooltip({ x, y, children }: { x: number | string; y: number | string; children: ReactNode }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: 'translate(-50%, -100%)',
      background: 'var(--navy)', color: '#fff', borderRadius: 8, padding: '8px 11px',
      fontSize: 11.5, lineHeight: 1.5, whiteSpace: 'normal', pointerEvents: 'none', zIndex: 20,
      boxShadow: 'var(--shadow-md)', maxWidth: 260,
    }}>
      {children}
    </div>
  )
}

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', GBP: '£', EUR: '€' }
function fmtMoney(valueMillions: number, currency: string): string {
  const sym = CURRENCY_SYMBOL[currency] ?? ''
  return `${sym}${(valueMillions / 1000).toFixed(1)}bn`
}

// FY covers 4 quarters, H1/H2 cover 2: reported periods in quarters.json are mixed
// granularity (FY2025, H1 2026, Q2 2026 for AstraZeneca; FY + Q1 + Q2 for the rest).
// Plotting those raw figures on one line would read as a revenue collapse that isn't
// real: it's just a shrinking reporting window. Normalize to a quarterly run-rate
// so every point on the axis means the same thing: revenue per quarter.
function periodQuarterSpan(label: string): number {
  if (/^FY/i.test(label)) return 4
  if (/^H[12]/i.test(label)) return 2
  return 1
}
function runRate(point: { label: string; valueMillions: number | null }): number | null {
  return point.valueMillions === null ? null: point.valueMillions / periodQuarterSpan(point.label)
}

// ─── Band 2: revenue trend line, real axis. `bare` skips the card/header
// chrome so a caller (e.g. a per-account deep-dive panel) can supply its own. ─
export function QuarterLineChart({ facet, evidenceById, openEvidence, bare = false }: {
  facet: QuarterFacet
  evidenceById: Record<string, EvidenceItem>
  openEvidence: OpenEvidence
  bare?: boolean
}) {
  const [hover, setHover] = useState<number | null>(null)
  const W = bare ? 520: 300, H = bare ? 320: 168
  const PAD_L = bare ? 64: 52, PAD_R = 16, PAD_T = 16, PAD_B = bare ? 32: 26
  const runRates = facet.points.map(runRate)
  const vals = runRates.filter((v): v is number => v !== null)
  const rawMin = vals.length ? Math.min(...vals): 0
  const rawMax = vals.length ? Math.max(...vals): 1
  const pad = (rawMax - rawMin) * 0.15 || rawMax * 0.1 || 1
  const min = Math.max(0, rawMin - pad)
  const max = rawMax + pad
  const span = (max - min) || 1
  const n = facet.points.length
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B
  const xFor = (i: number) => n <= 1 ? PAD_L + plotW / 2: PAD_L + (i * plotW) / (n - 1)
  const yFor = (v: number | null) => v === null ? PAD_T + plotH / 2: PAD_T + plotH - ((v - min) / span) * plotH

  const gridCount = 3
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => min + (span * i) / gridCount)
  const mixedGranularity = facet.points.some(p => periodQuarterSpan(p.label) !== 1)
  const hasEstimated = facet.points.some(p => p.estimated)

  const body = (
    <>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHover(null)}>
          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={PAD_L} y1={yFor(g)} x2={W - PAD_R} y2={yFor(g)} stroke="var(--border)" strokeWidth={1} strokeDasharray={i === 0 ? undefined: '2 4'} />
              <text x={PAD_L - 6} y={yFor(g) + 3} textAnchor="end" fontSize={9} fill="var(--text-3)">{fmtMoney(g, facet.currency)}</text>
            </g>
          ))}

          {facet.points.slice(1).map((p, i0) => {
            const i = i0 + 1
            const prev = facet.points[i - 1]
            const segEstimated = p.estimated || prev.estimated
            return (
              <line key={`seg-${p.evidenceId}`} x1={xFor(i - 1)} y1={yFor(runRates[i - 1])} x2={xFor(i)} y2={yFor(runRates[i])}
                stroke={facet.accentColor} strokeWidth={2} strokeLinecap="round"
                strokeDasharray={segEstimated ? '5 4': undefined} opacity={segEstimated ? 0.6: 1} />
            )
          })}
          {facet.points.map((p, i) => (
            <g key={p.evidenceId}>
              <circle cx={xFor(i)} cy={yFor(runRates[i])} r={hover === i ? 5: 4}
                fill={p.estimated ? 'var(--bg-surface)': facet.accentColor}
                stroke={facet.accentColor} strokeWidth={2} />
              <circle cx={xFor(i)} cy={yFor(runRates[i])} r={14} fill="transparent"
                onMouseEnter={() => setHover(i)}
                onClick={() => { const ev = evidenceById[p.evidenceId]; if (ev) openEvidence(facet.accountName, ev.title, [ev]) }}
                style={{ cursor: 'pointer' }} />
              <text x={xFor(i)} y={H - 6} textAnchor="middle" fontSize={9.5} fontWeight={600} fill="var(--text-3)">{p.label}{p.estimated ? '*': ''}</text>
            </g>
          ))}
        </svg>
        {hover !== null && (() => {
          const p = facet.points[hover]
          const rr = runRates[hover]
          const cx = (xFor(hover) / W) * 100
          const cy = (yFor(rr) / H) * 100
          return (
            <div style={{ position: 'absolute', left: `${cx}%`, top: `${cy}%`, pointerEvents: 'none' }}>
              <Tooltip x={0} y={-10}>
                <strong>{p.label}</strong>
                {p.valueMillions !== null && <div>{fmtMoney(p.valueMillions, facet.currency)} reported{periodQuarterSpan(p.label) !== 1 ? ` (${fmtMoney(rr!, facet.currency)}/quarter)`: ''}</div>}
                {p.growthPct !== null && <div>{p.growthPct > 0 ? '+': ''}{p.growthPct}% growth</div>}
              </Tooltip>
            </div>
          )
        })()}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 4, textAlign: bare ? 'left': 'center' }}>
        {hasEstimated && <span>* dashed segment = derived or estimated, not a reported figure. </span>}
        {mixedGranularity ? 'Normalized to a per-quarter run-rate: reporting periods mix FY/half-year/quarter. ': ''}
        Click a point for the full record.
      </div>
    </>
  )

  if (bare) return body

  return (
    <div className="card card-clickable" style={{ padding: '14px 16px', width: '100%', minWidth: 0, maxWidth: 320 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: facet.accentColor, flexShrink: 0 }} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{facet.accountName}</span>
        <span style={{ fontSize: 10.5, color: 'var(--text-3)', marginLeft: 'auto', flexShrink: 0 }}>{facet.currency} / quarter</span>
      </div>
      {body}
    </div>
  )
}

// ─── Band 2 hero: QoQ momentum slope, one line per account on a shared axis ──
export function SlopeGraph({ momentum, evidenceById, openEvidence }: {
  momentum: MomentumPoint[]
  evidenceById: Record<string, EvidenceItem>
  openEvidence: OpenEvidence
}) {
  const [hover, setHover] = useState<string | null>(null)
  const W = 640, H = 300, PAD_X = 150, PAD_Y = 30
  const withValues = momentum.filter(m => m.priorPct !== null && m.currentPct !== null)
  const all = withValues.flatMap(m => [m.priorPct as number, m.currentPct as number])
  const rawMin = all.length ? Math.min(...all, 0): 0
  const rawMax = all.length ? Math.max(...all, 0): 1
  const pad = (rawMax - rawMin) * 0.2 || 5
  const min = rawMin - pad, max = rawMax + pad
  const span = (max - min) || 1
  const yFor = (v: number) => H - PAD_Y - ((v - min) / span) * (H - 2 * PAD_Y)
  const leftX = PAD_X + 10, rightX = W - PAD_X

  if (withValues.length === 0) {
    return <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No comparable quarter-over-quarter figures available.</div>
  }

  const gridCount = 4
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => min + (span * i) / gridCount)

  // Nudge overlapping delta labels apart vertically (accounts often land close together)
  //: the lines/markers stay at their true data position, only the label text moves.
  const declutter = (entries: { key: string; y: number }[], minGap: number) => {
    const arr = entries.slice().sort((a, b) => a.y - b.y)
    for (let i = 1; i < arr.length; i++) if (arr[i].y - arr[i - 1].y < minGap) arr[i].y = arr[i - 1].y + minGap
    return new Map(arr.map(e => [e.key, e.y]))
  }
  const leftLabelY = declutter(withValues.map(m => ({ key: m.accountId, y: yFor(m.priorPct as number) })), 15)
  const rightLabelY = declutter(withValues.map(m => ({ key: m.accountId, y: yFor(m.currentPct as number) })), 15)

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)}>
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={leftX} y1={yFor(g)} x2={rightX} y2={yFor(g)} stroke="var(--border)" strokeWidth={1} strokeDasharray={Math.abs(g) < 0.01 ? undefined: '2 4'} />
            <text x={leftX - 46} y={yFor(g) + 4} textAnchor="end" fontSize={10.5} fill="var(--text-3)">{g >= 0 ? '+': ''}{g.toFixed(0)}%</text>
          </g>
        ))}
        {withValues.map(m => {
          const y1 = yFor(m.priorPct as number), y2 = yFor(m.currentPct as number)
          const active = hover === m.accountId
          return (
            <g key={m.accountId}
              onMouseEnter={() => setHover(m.accountId)}
              onClick={() => { const ev = evidenceById[m.currentQuarterEvidenceId]; if (ev) openEvidence(m.accountName, `${m.accountName}: Momentum`, [ev]) }}
              style={{ cursor: 'pointer' }}>
              <line x1={leftX} y1={y1} x2={rightX} y2={y2} stroke={m.accentColor} strokeWidth={active ? 4: 2.5} strokeLinecap="round" opacity={active || hover === null ? 1: 0.3} />
              <circle cx={leftX} cy={y1} r={5} fill={m.accentColor} opacity={active || hover === null ? 1: 0.3} />
              <circle cx={leftX} cy={y1} r={14} fill="transparent" />
              <circle cx={rightX} cy={y2} r={5} fill={m.accentColor} opacity={active || hover === null ? 1: 0.3} />
              <circle cx={rightX} cy={y2} r={16} fill="transparent" />
              <text x={leftX - 10} y={(leftLabelY.get(m.accountId) ?? y1) + 4} textAnchor="end" fontSize={12.5} fontWeight={800} fill="var(--text-1)" opacity={active || hover === null ? 1: 0.3}>
                {m.priorPct}%
              </text>
              <text x={rightX + 10} y={(rightLabelY.get(m.accountId) ?? y2) + 4} fontSize={12.5} fontWeight={800} fill="var(--text-1)" opacity={active || hover === null ? 1: 0.3}>
                {m.currentPct}%
                {m.deltaPct !== null && (
                  <tspan fill={m.deltaPct >= 0 ? 'var(--gold-muted)': 'var(--text-3)'} fontWeight={700} fontSize={10.5}> ({m.deltaPct >= 0 ? '+': ''}{m.deltaPct}%)</tspan>
                )}
              </text>
            </g>
          )
        })}
        <text x={leftX} y={H - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text-3)">Prior Quarter</text>
        <text x={rightX} y={H - 4} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--text-3)">Current Quarter</text>
      </svg>
      {hover && (() => {
        const m = withValues.find(x => x.accountId === hover)!
        return (
          <Tooltip x="50%" y={16}>
            <strong>{m.accountName}</strong>
            <div>{m.priorLabel}: {m.priorPct}% → {m.currentLabel}: {m.currentPct}%</div>
            {m.deltaPct !== null && <div>QoQ delta: {m.deltaPct >= 0 ? '+': ''}{m.deltaPct}%</div>}
          </Tooltip>
        )
      })()}
      {/* legend: identity via color + name, never color-alone, and no on-chart collision */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
        {withValues.map(m => (
          <button key={m.accountId} onMouseEnter={() => setHover(m.accountId)} onMouseLeave={() => setHover(null)}
            onClick={() => { const ev = evidenceById[m.currentQuarterEvidenceId]; if (ev) openEvidence(m.accountName, `${m.accountName}: Momentum`, [ev]) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: hover === m.accountId ? 700: 500 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: m.accentColor }} />
            {m.accountName}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Band 3 hero: Opportunity vs. Risk donut ──────────────────────────────
// Pie/donut segments never mix hue families within one chart: the family is chosen
// by the surface it sits on, not by account identity (that's what the legend row is
// for). Gold shades on dark hero surfaces, navy shades on light card surfaces.
export const PIE_RAMP_GOLD = ['#e8c547', '#D4AF37', '#b89428', '#8a6b1f', '#f5edcc']
export const PIE_RAMP_NAVY = ['#1B365D', '#2e5a96', '#244878', '#0d1a2e', '#5a7499']
export function rampColor(ramp: string[], index: number): string { return ramp[index % ramp.length] }

export interface PieSegment { key: string; label: string; value: number; color: string }
function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function PieChart({ segments, size = 220, thickness = 38, solid = false, onSegmentClick, centerLabel, centerSub, showLegend = true }: {
  segments: PieSegment[]
  size?: number
  thickness?: number
  /** True pie (filled wedges, no donut hole): used for the two full-section pies. */
  solid?: boolean
  onSegmentClick?: (key: string) => void
  centerLabel?: string
  centerSub?: string
  showLegend?: boolean
}) {
  const [hover, setHover] = useState<string | null>(null)
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = solid ? size / 2 - 2: (size - thickness) / 2
  const cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  let cumulative = 0
  let cumulativeDeg = -90

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={solid ? undefined: { transform: 'rotate(-90deg)' }}>
          {!solid && <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={thickness} />}
          {solid && segments.length === 1 && <circle cx={cx} cy={cy} r={r} fill={segments[0].color} />}
          {segments.map(s => {
            const active = hover === s.key
            if (solid) {
              if (segments.length === 1) return null
              const frac = s.value / total
              const startDeg = cumulativeDeg
              const sweepDeg = frac * 360
              cumulativeDeg += sweepDeg
              const endDeg = cumulativeDeg
              const start = polarPoint(cx, cy, r, startDeg)
              const end = polarPoint(cx, cy, r, endDeg)
              const largeArc = sweepDeg > 180 ? 1: 0
              const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
              return (
                <path key={s.key} d={path} fill={s.color}
                  opacity={hover === null || active ? 1: 0.5}
                  stroke="var(--bg-surface)" strokeWidth={active ? 0: 1.5}
                  style={{ cursor: onSegmentClick ? 'pointer': 'default', transition: 'opacity 150ms ease', transform: active ? `scale(1.03)`: undefined, transformOrigin: `${cx}px ${cy}px` }}
                  onMouseEnter={() => setHover(s.key)} onMouseLeave={() => setHover(null)}
                  onClick={() => onSegmentClick?.(s.key)} />
              )
            }
            const frac = s.value / total
            const dash = frac * circumference
            const offset = cumulative * circumference
            cumulative += frac
            return (
              <circle key={s.key} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.color} strokeWidth={active ? thickness + 6: thickness}
                strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-offset}
                opacity={hover === null || active ? 1: 0.45}
                style={{ cursor: onSegmentClick ? 'pointer': 'default', transition: 'stroke-width 150ms ease, opacity 150ms ease' }}
                onMouseEnter={() => setHover(s.key)} onMouseLeave={() => setHover(null)}
                onClick={() => onSegmentClick?.(s.key)} />
            )
          })}
        </svg>
        {!solid && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            {hover ? (() => {
              const s = segments.find(x => x.key === hover)!
              return (
                <>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>{Math.round((s.value / total) * 100)}%</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{s.label} ({s.value})</div>
                </>
              )
            })(): (
              <>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>{centerLabel ?? total}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{centerSub ?? 'signals'}</div>
              </>
            )}
          </div>
        )}
      </div>
      {showLegend && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {segments.map(s => (
            <button key={s.key} onClick={() => onSegmentClick?.(s.key)}
              onMouseEnter={() => setHover(s.key)} onMouseLeave={() => setHover(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-2)', background: 'none', border: 'none', cursor: onSegmentClick ? 'pointer': 'default', padding: 0, fontWeight: hover === s.key ? 700: 500 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
              {s.label} · {s.value}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

