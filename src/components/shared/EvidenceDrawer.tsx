import { Fragment, useEffect } from 'react'
import { X, ArrowLeft, ExternalLink, Sparkles, Quote, Compass, Target, CheckCircle2, AlertCircle, Link2, AlertTriangle, TrendingUp } from 'lucide-react'
import type { EvidenceItem } from '../../lib/orgIntelligence'
import { Bullets } from './Bullets'

export interface DrawerView {
  eyebrow: string
  title: string
  items: EvidenceItem[]
  emptyLabel?: string
}

/** Navy/gold only: the platform's one reserved status palette (RAG) is intentionally not used here. */
function Pill({ tone, children }: { tone: 'navy' | 'gold' | 'goldSolid'; children: React.ReactNode }) {
  const map = {
    navy: { bg: 'var(--navy-faint)', fg: 'var(--navy)' },
    gold: { bg: 'var(--gold-light)', fg: 'var(--gold-muted)' },
    goldSolid: { bg: 'var(--gold)', fg: '#1B365D' },
  }[tone]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: map.bg, color: map.fg }}>
      {children}
    </span>
  )
}

/**
 * Evidence overlay: centered on screen (docs/home-ui-spec.md §10, revised per direct
 * product feedback: centered, visual, navy/gold-only, no dense paragraph walls).
 * Fact / AI hypothesis / recommendation stay visually distinct sections, icon-led.
 */
export default function EvidenceDrawer({
  stack, onClose, onBack,
}: {
  stack: DrawerView[]
  onClose: () => void
  onBack: () => void
}) {
  const view = stack[stack.length - 1]

  useEffect(() => {
    if (!view) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [view, onClose])

  if (!view) return null

  return (
    <div onClick={onClose} role="presentation"
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,26,46,0.55)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 20px', overflowY: 'auto', animation: 'fadeIn 140ms ease' }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={view.title}
        style={{
          width: 640, maxWidth: '94vw', background: '#ffffff', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(13,26,46,0.4)', borderTop: '5px solid var(--gold)',
          animation: 'popIn 180ms cubic-bezier(0.34,1.56,0.64,1)',
        }}>
        {/* header */}
        <div style={{ padding: '20px 26px 16px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button onClick={onClose} aria-label="Close"
            style={{ position: 'absolute', top: 16, right: 18, background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-3)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={17} />
          </button>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>{view.eyebrow}</div>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: 'var(--text-1)', margin: 0, lineHeight: 1.3, paddingRight: 40, fontFamily: 'Playfair Display, Georgia, serif' }}>{view.title}</h2>
          {stack.length > 1 && (
            <button onClick={onBack} className="btn btn-ghost" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', fontSize: 12 }}>
              <ArrowLeft size={13} /> Back
            </button>
          )}
        </div>

        {/* body */}
        <div style={{ padding: '18px 26px 22px', maxHeight: '66vh', overflowY: 'auto' }}>
          {view.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 12px', color: 'var(--text-3)', fontSize: 13.5 }}>
              {view.emptyLabel ?? 'No evidence recorded for this item.'}
            </div>
          ): (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {view.items.map((item, i) => <EvidenceCard key={item.id + i} item={item} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const polarityTone = item.opportunity_or_risk === 'Opportunity' ? 'goldSolid': item.opportunity_or_risk === 'Risk' ? 'navy': 'gold'
  const urgencyTone = item.urgency === 'High' ? 'goldSolid': item.urgency === 'Medium' ? 'gold': 'navy'

  // Points already rendered elsewhere in this card — "connected signals" must add
  // independent modules, never repeat them (no "same points repeated" cards).
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.;!?]+$/, '')
  const renderedSents = new Set(
    [item.what_happened, item.evidence, item.ai_hypothesis,
     [item.so_what, item.why_it_matters].filter(Boolean).join(' '),
     item.if_no_action, item.expected_outcome, item.next_best_action,
     ...(item.nbas ?? []).flatMap(n => [n.action, n.whyNow ?? '', n.outcome ?? ''])]
      .filter(Boolean).join(' ').split(/(?<=[.;])\s+(?=[A-Z0-9"'“])/g).map(norm).filter(Boolean),
  )
  const isRepeat = (signal: string) => renderedSents.has(norm(signal))
  const connected = (item.connectedModules ?? []).filter((m, i, arr) =>
    !isRepeat(m.signal) && arr.findIndex(x => norm(x.signal) === norm(m.signal)) === i)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)', background: 'var(--navy-faint)' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {item.accountName && <Pill tone="navy">{item.accountName}</Pill>}
          {item.categoryLabel && <Pill tone="navy">{item.categoryLabel}</Pill>}
          {item.opportunity_or_risk && <Pill tone={polarityTone as any}>{item.opportunity_or_risk}</Pill>}
          {item.urgency && <Pill tone={urgencyTone as any}>{item.urgency} urgency</Pill>}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.35 }}>{item.title}</div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {item.what_happened && (
          <div style={{ margin: '0 0 12px' }}>
            <Bullets items={item.what_happened} style={{ marginTop: 0 }} />
          </div>
        )}

        {/* Connected Intelligence: independent signals across modules converging on
            the interpretation — the platform's differentiator vs a single metric. */}
        {connected.length > 0 && (
          <div style={{ margin: '0 0 12px', border: '1px solid var(--navy-faint)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: 'var(--navy-faint)' }}>
              <RowLabel icon={<Link2 size={13} />} tone="navy">Connected signals · {connected.length} modules</RowLabel>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {connected.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                  <span style={{ flexShrink: 0, minWidth: 108, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--navy)', paddingTop: 1 }}>{m.module}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-1)', lineHeight: 1.5 }}>{m.signal}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.evidence && <IconRow icon={<Quote size={13} />} label="Evidence" text={item.evidence} italic />}

        {((item.positives && item.positives.length > 0) || (item.negatives && item.negatives.length > 0)) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 0 12px' }} className="home-drawer-goodbad">
            <div>
              <RowLabel icon={<CheckCircle2 size={12} />} tone="gold">Going well</RowLabel>
              {item.positives && item.positives.length > 0 ? (
                <ul style={{ margin: '5px 0 0', paddingLeft: 16, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
                  {item.positives.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              ): <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5 }}>Nothing flagged.</div>}
            </div>
            <div>
              <RowLabel icon={<AlertCircle size={12} />} tone="navy">Watch</RowLabel>
              {item.negatives && item.negatives.length > 0 ? (
                <ul style={{ margin: '5px 0 0', paddingLeft: 16, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
                  {item.negatives.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              ): <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5 }}>Nothing flagged.</div>}
            </div>
          </div>
        )}

        {item.factBlock && item.factBlock.length > 0 && (
          <div style={{ margin: '0 0 12px' }}>
            <RowLabel icon={<Compass size={13} />}>Reported figures</RowLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', fontSize: 12.5, marginTop: 4 }}>
              {item.factBlock.map(f => (
                <Fragment key={f.label}><RowKV label={f.label} value={f.value} /></Fragment>
              ))}
            </div>
          </div>
        )}

        {item.ai_hypothesis && (
          <div style={{ margin: '0 0 12px', background: 'var(--navy-faint)', borderRadius: 'var(--radius-sm)', padding: '10px 13px' }}>
            <RowLabel icon={<Sparkles size={13} />} tone="navy">AI hypothesis</RowLabel>
            <Bullets items={item.ai_hypothesis} compact style={{ marginTop: 4 }} />
          </div>
        )}

        {(item.so_what || item.why_it_matters) && (
          <div style={{ margin: '0 0 12px', border: '1.5px solid var(--gold)', borderRadius: 'var(--radius-sm)', padding: '10px 13px' }}>
            <RowLabel icon={<Compass size={13} />} tone="gold">Business impact · why it matters</RowLabel>
            <Bullets items={[item.so_what, item.why_it_matters].filter(Boolean).filter((s, i, a) => a.indexOf(s) === i).join(' ')} compact style={{ marginTop: 4 }} />
          </div>
        )}

        {item.if_no_action && (
          <div style={{ margin: '0 0 12px', background: 'var(--navy-faint)', borderRadius: 'var(--radius-sm)', padding: '10px 13px' }}>
            <RowLabel icon={<AlertTriangle size={13} />} tone="navy">If no action is taken</RowLabel>
            <Bullets items={item.if_no_action} compact style={{ marginTop: 4 }} />
          </div>
        )}

        {/* Structured NBAs (action / why-now / outcome) take priority over the
            single-line next_best_action when supplied. */}
        {item.nbas && item.nbas.length > 0 ? (
          <div style={{ background: 'var(--gold-light)', borderRadius: 'var(--radius-sm)', padding: '10px 13px', marginTop: 4 }}>
            <RowLabel icon={<Target size={13} />} tone="gold">Next best action{item.nbas.length > 1 ? 's' : ''}</RowLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {item.nbas.map((n, i) => (
                <div key={i} style={{ borderTop: i === 0 ? 'none' : '1px dashed var(--gold)', paddingTop: i === 0 ? 0 : 8 }}>
                  <Bullets items={n.action} compact />
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px', marginTop: 5, fontSize: 11.5 }}>
                    {n.whyNow && <NbaKV k="Why now" v={n.whyNow} />}
                    {n.outcome && <NbaKV k="Outcome" v={n.outcome} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : item.next_best_action && (
          <div style={{ background: 'var(--gold-light)', borderRadius: 'var(--radius-sm)', padding: '10px 13px', marginTop: 4 }}>
            <RowLabel icon={<Target size={13} />} tone="gold">Next best action</RowLabel>
            <Bullets items={item.next_best_action} compact style={{ marginTop: 4 }} />
          </div>
        )}

        {item.expected_outcome && (
          <div style={{ marginTop: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 13px' }}>
            <RowLabel icon={<TrendingUp size={13} />} tone="gold">Expected outcome · success measure</RowLabel>
            <Bullets items={item.expected_outcome} compact style={{ marginTop: 4 }} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          {item.priority && <Pill tone="goldSolid">{item.priority} priority</Pill>}
          {item.confidence && <Pill tone="navy">{item.confidence} confidence</Pill>}
          {item.dateISO && <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{item.dateISO}</span>}
        </div>

        {item.evidence_gaps && (
          <div style={{ marginTop: 10 }}>
            <RowLabel icon={<AlertCircle size={12} />}>Evidence gaps</RowLabel>
            <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55, margin: '3px 0 0', fontStyle: 'italic' }}>{item.evidence_gaps}</p>
          </div>
        )}

        {item.sources.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
            <RowLabel icon={<ExternalLink size={12} />}>Source references</RowLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 5 }}>
              {item.sources.map(s => (
                <a key={s.url} href={s.url} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, wordBreak: 'break-word' }}>
                  {s.label} <ExternalLink size={11} style={{ flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RowLabel({ icon, tone = 'muted', children }: { icon: React.ReactNode; tone?: 'muted' | 'navy' | 'gold'; children: React.ReactNode }) {
  const color = tone === 'navy' ? 'var(--navy)': tone === 'gold' ? 'var(--gold-muted)': 'var(--text-3)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
      {icon}{children}
    </div>
  )
}

function NbaKV({ k, v }: { k: string; v: string }) {
  return (
    <>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-muted)', paddingTop: 2, whiteSpace: 'nowrap' }}>{k}</span>
      <span style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.5 }}>{v}</span>
    </>
  )
}

function RowKV({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      <span style={{ color: 'var(--text-1)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </>
  )
}

function IconRow({ icon, label, text, italic }: { icon: React.ReactNode; label: string; text: string; italic?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <RowLabel icon={icon}>{label}</RowLabel>
      <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '4px 0 0', fontStyle: italic ? 'italic': 'normal' }}>{text}</p>
    </div>
  )
}
