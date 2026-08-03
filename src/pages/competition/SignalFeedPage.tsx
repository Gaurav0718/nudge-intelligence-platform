import { useState, useMemo } from 'react'
import { X, Radio, ExternalLink, Layers, ChevronRight } from 'lucide-react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import ServiceLineSelector from '../../components/shared/ServiceLineSelector'
import { Badge, SectionHeading, Card, AccentCallout, ConfidencePill } from '../../components/shared/ui'
import { Bullets } from '../../components/shared/Bullets'
import {
  COMPETITORS, SIGNALS, SIGNAL_TYPES, SIGNAL_TRIANGULATIONS, type CompetitorSignal,
} from '../../data/competition.seed'
import { COMPETITION_TABS } from './CompetitorListPage'

const TYPE_BADGE: Record<string, string> = {
  Acquisition: 'red', 'Analyst recognition': 'blue', 'Corporate recognition': 'blue',
  'Customer announcement': 'emerald', 'Event participation': 'navy', 'Executive appointment': 'amber',
  'Industry or partner award': 'gold', 'Organisational change': 'amber', Partnership: 'teal',
  'Platform integration': 'teal', 'Product launch': 'emerald', 'Technology architecture': 'navy',
}

export default function SignalFeedPage() {
  const [comp, setComp] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)
  const [active, setActive] = useState<CompetitorSignal | null>(null)

  const compName = (id: string) => COMPETITORS.find(c => c.id === id)?.name ?? id

  const sorted = useMemo(() => [...SIGNALS].sort((a, b) => b.signal_date.localeCompare(a.signal_date)), [])
  const filtered = sorted.filter(s =>
    (!comp || s.competitor_id === comp) && (!type || s.signal_type === type))

  // Triangulations relevant to the current competitor filter (all when unfiltered)
  const triangulations = SIGNAL_TRIANGULATIONS.filter(t => !comp || t.competitor_ids.includes(comp))
  const signalById = (id: string) => SIGNALS.find(s => s.id === id)

  return (
    <div>
      <SectionHeading eyebrow="Competition Module" title="Signal Feed"
        sub="Chronological feed of tracked competitor signals with source receipts, cross-signal triangulation and analyst context." />
      <ModuleTabBar tabs={COMPETITION_TABS} />

      {/* ── Clean dropdown filter bar (replaces pill rows) ─────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <ServiceLineSelector label="COMPETITOR" allLabel="All competitors"
          options={COMPETITORS.map(c => ({ id: c.id, label: c.name }))} value={comp} onChange={setComp} />
        <ServiceLineSelector label="SIGNAL TYPE" allLabel="All signal types"
          options={SIGNAL_TYPES.map(t => ({ id: t, label: t }))} value={type} onChange={setType} />
        {(comp || type) && (
          <button onClick={() => { setComp(null); setType(null) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', background: 'var(--navy-faint)', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
            <X size={13} /> Clear filters
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--text-3)' }}>
          {filtered.length} of {SIGNALS.length} signals{comp ? ` · ${compName(comp)}` : ''}{type ? ` · ${type}` : ''}
        </div>
      </div>

      {/* ── Signals Triangulated ───────────────────────────────────────────── */}
      {triangulations.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Layers size={16} style={{ color: 'var(--brand)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>Signals Triangulated</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· cross-signal synthesis across competitors</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {triangulations.map(t => (
              <Card key={t.id} style={{ padding: 18, borderLeft: '3px solid var(--gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <ConfidencePill level={t.confidence} />
                  {t.competitor_ids.map(id => <Badge key={id} color="navy">{compName(id)}</Badge>)}
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{t.title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 12px' }}>{t.synthesis}</p>
                <AccentCallout tone="navy" label="Implication for Company">{t.implication}</AccentCallout>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>Triangulated from</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {t.signal_ids.map(sid => {
                      const s = signalById(sid)
                      if (!s) return null
                      return (
                        <button key={sid} onClick={() => setActive(s)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 7, background: 'var(--navy-faint)', color: 'var(--navy)', border: 'none', cursor: 'pointer', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.headline.slice(0, 40)}{s.headline.length > 40 ? '…' : ''} <ChevronRight size={11} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Chronological feed + receipt ───────────────────────────────────── */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 12 }}>Signal Timeline</div>
      <div className="feed-layout" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14, background: 'var(--bg-raised)', borderRadius: 12, border: '1px dashed var(--border)' }}>
              No signals match this filter combination.
            </div>
          ) : filtered.map(s => (
            <Card key={s.id} clickable onClick={() => setActive(s)}
              style={{ padding: 16, ...(active?.id === s.id ? { borderColor: 'var(--navy)', boxShadow: 'var(--glow-card-hover)' } : null) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <Badge color="navy">{compName(s.competitor_id)}</Badge>
                <Badge color={(TYPE_BADGE[s.signal_type] ?? 'gold') as any}>{s.signal_type}</Badge>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.signal_date}</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{s.headline}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{s.what_happened}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {s.service_line_tags.map(t => <span key={t} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--navy-faint)', color: 'var(--navy)' }}>{t}</span>)}
              </div>
            </Card>
          ))}
        </div>

        {active && (
          <div className="feed-receipt" style={{ width: 380, flexShrink: 0, position: 'sticky', top: 76 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand)' }}>
                  <Radio size={14} /> Signal receipt
                </div>
                <button onClick={() => setActive(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><X size={18} /></button>
              </div>
              <Badge color="navy" style={{ marginBottom: 8 }}>{compName(active.competitor_id)}</Badge>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>{active.headline}</div>
              <ReceiptRow label="Type" value={active.signal_type} />
              <ReceiptRow label="Date" value={active.signal_date} />
              <ReceiptRow label="Source" value={active.source_name} />
              {active.source_url && (
                <a href={active.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: 'var(--navy)', display: 'inline-flex', gap: 5, alignItems: 'center', margin: '4px 0 12px' }}>Open source <ExternalLink size={12} /></a>
              )}
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 10 }}><strong>What happened:</strong> {active.what_happened}</div>
              <AccentCallout tone="navy" label="Why it matters"><Bullets items={active.why_it_matters} /></AccentCallout>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0', borderBottom: '1px dashed var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}
