import { useState } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import ServiceLineSelector from '../../components/shared/ServiceLineSelector'
import { SectionHeading, Card, Badge } from '../../components/shared/ui'
import DetailModal, { ModalSection } from '../../components/shared/DetailModal'
import { TOPICS, topicSource, type Topic } from '../../data/marketing.seed'
import { SERVICE_LINES, serviceLineLabel } from '../../data/shared'
import { MARKETING_TABS } from './marketingTabs'

const SUB_TABS = ['Topic Landscape', 'Content Intelligence', 'Whitespace', 'Competitor Insight'] as const
type Sub = typeof SUB_TABS[number]

// Single navy series for all metrics/graphs. Badge keeps a small semantic tint for identity only.
const CLASS_META: Record<Topic['classification'], { color: string; badge: any; label: string }> = {
  Whitespace:    { color: 'var(--navy)', badge: 'navy', label: 'Whitespace' },
  Popular:       { color: 'var(--navy)', badge: 'navy', label: 'Popular' },
  Oversaturated: { color: 'var(--navy)', badge: 'navy', label: 'Oversaturated' },
}

// What a topic means for Company — derived from classification + Company status.
function topicMeaning(t: Topic): string {
  if (t.classification === 'Whitespace') return t.indegene_status === 'Gap'
    ? 'Uncontested opening Company does not yet serve — the highest-value land-grab. Move first before a rival defines the category.'
    : 'Open field Company already plays in — expand aggressively while the space is still thin and reference wins are cheap.'
  if (t.classification === 'Popular') return 'Actively contested and growing. Win on execution depth, proof points and governance — not novelty. Expect competitive RFPs here.'
  return 'Crowded and commoditizing. Defend margin, avoid me-too positioning, and use it only as a door-opener to higher-value adjacent work.'
}
const momentum = (t: Topic) => t.activity_trend[t.activity_trend.length - 1].value - t.activity_trend[0].value

export default function MarketPulsePage() {
  const [sub, setSub] = useState<Sub>('Topic Landscape')
  const [sl, setSl] = useState<string | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [cell, setCell] = useState<{ sl: string; cls: Topic['classification'] } | null>(null)
  const [comp, setComp] = useState<string | null>(null)
  const slFilter = (sub === 'Topic Landscape' || sub === 'Whitespace')

  return (
    <div>
      <SectionHeading eyebrow="Marketing & Service Line" title="Market Pulse"
        sub="Topic-level market activity across the six service lines — where the field is crowding in, where it's thinning out, and where Company has whitespace to own. Click any tile, cell or competitor for detail." />
      <ModuleTabBar tabs={MARKETING_TABS} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {SUB_TABS.map(s => (
          <button key={s} className={`pill-filter${sub === s ? ' active' : ''}`} onClick={() => setSub(s)}>{s}</button>
        ))}
        {slFilter && (
          <div style={{ marginLeft: 'auto' }}>
            <ServiceLineSelector options={SERVICE_LINES} value={sl} onChange={setSl} allLabel="All service lines" />
          </div>
        )}
      </div>

      {sub === 'Topic Landscape' && <TopicLandscape sl={sl} onPick={setTopic} />}
      {sub === 'Content Intelligence' && <ContentIntelligence onPick={(s, c) => setCell({ sl: s, cls: c })} />}
      {sub === 'Whitespace' && <TopicList filter="Whitespace" sl={sl} onPick={setTopic} />}
      {sub === 'Competitor Insight' && <CompetitiveHeat onPick={setComp} />}

      {/* ── Topic detail popup ─────────────────────────────────────────────── */}
      {topic && (
        <DetailModal eyebrow={`${serviceLineLabel(topic.service_line)} · Topic`} title={topic.name} onClose={() => setTopic(null)}
          sourceLabel={topicSource(topic).label} sourceUrl={topicSource(topic).url}
          badges={<>
            <Badge color={CLASS_META[topic.classification].badge}>{topic.classification}</Badge>
            <Badge color="navy">{serviceLineLabel(topic.service_line)}</Badge>
            <Badge color={topic.indegene_status === 'Gap' ? 'amber' : 'emerald'}>{topic.indegene_status === 'Gap' ? 'Company gap' : 'Company active'}</Badge>
          </>}>
          <ModalSection label="What this is">
            A {topic.classification.toLowerCase()} topic in {serviceLineLabel(topic.service_line)}. Activity index moved from {topic.activity_trend[0].value} to {topic.activity_trend[topic.activity_trend.length - 1].value} over four quarters ({momentum(topic) >= 0 ? '+' : ''}{momentum(topic)} momentum).
          </ModalSection>
          <ModalSection label="What it means for Company">{topicMeaning(topic)}</ModalSection>
          <ModalSection label="Who is driving it">
            {topic.driven_by.length ? topic.driven_by.join(', ') : 'No competitor clearly leading — open field.'}
          </ModalSection>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>Activity trend</div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={topic.activity_trend} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
              <Tooltip formatter={(v: number) => [`${v}`, 'Activity index']} />
              <Area type="monotone" dataKey="value" stroke={CLASS_META[topic.classification].color} fill={CLASS_META[topic.classification].color} fillOpacity={0.16} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </DetailModal>
      )}

      {/* ── Heatmap cell popup ─────────────────────────────────────────────── */}
      {cell && (() => {
        const items = TOPICS.filter(t => t.service_line === cell.sl && t.classification === cell.cls)
        const slLabel = serviceLineLabel(cell.sl)
        return (
          <DetailModal eyebrow="Content Intelligence" title={`${slLabel} — ${cell.cls}`} onClose={() => setCell(null)}
            sourceLabel="Company Market Scan" sourceUrl="https://www.indegene.com/what-we-think"
            badges={<Badge color={CLASS_META[cell.cls].badge}>{items.length} topic{items.length === 1 ? '' : 's'}</Badge>}>
            <ModalSection label="What this cell means">
              {cell.cls === 'Whitespace' && `${slLabel} has ${items.length} whitespace topic${items.length === 1 ? '' : 's'} — thin competitive density and room for Company to define the category.`}
              {cell.cls === 'Popular' && `${slLabel} has ${items.length} popular topic${items.length === 1 ? '' : 's'} — growing and contested; competitive execution matters most here.`}
              {cell.cls === 'Oversaturated' && `${slLabel} has ${items.length} oversaturated topic${items.length === 1 ? '' : 's'} — crowded and commoditizing; compete selectively.`}
            </ModalSection>
            {items.length === 0
              ? <div style={{ fontSize: 13.5, color: 'var(--text-3)' }}>No topics tracked in this cell yet.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(t => (
                    <button key={t.id} onClick={() => { setCell(null); setTopic(t) }}
                      style={{ textAlign: 'left', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CLASS_META[t.classification].color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{t.indegene_status === 'Gap' ? 'gap' : 'active'}</span>
                      <ArrowRight size={14} style={{ color: 'var(--text-3)' }} />
                    </button>
                  ))}
                </div>}
          </DetailModal>
        )
      })()}

      {/* ── Competitor popup ───────────────────────────────────────────────── */}
      {comp && (() => {
        const topics = TOPICS.filter(t => t.driven_by.includes(comp))
        return (
          <DetailModal eyebrow="Competitor Insight" title={comp} onClose={() => setComp(null)}
            sourceLabel={comp} sourceUrl={topicSource({ driven_by: [comp] } as Topic).url}
            badges={<Badge color="navy">Active across {topics.length} topic{topics.length === 1 ? '' : 's'}</Badge>}>
            <ModalSection label="Where this competitor is pressing">
              {comp} is visibly active across {topics.length} tracked topic{topics.length === 1 ? '' : 's'}, concentrated in {Array.from(new Set(topics.map(t => serviceLineLabel(t.service_line)))).join(', ') || '—'}.
            </ModalSection>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topics.map(t => (
                <button key={t.id} onClick={() => { setComp(null); setTopic(t) }}
                  style={{ textAlign: 'left', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: CLASS_META[t.classification].color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</span>
                  <Badge color={CLASS_META[t.classification].badge}>{t.classification}</Badge>
                </button>
              ))}
            </div>
          </DetailModal>
        )
      })()}
    </div>
  )
}

// ─── TOPIC LANDSCAPE — stat tile + mini bar trend ────────────────────────────
function TopicLandscape({ sl, onPick }: { sl: string | null; onPick: (t: Topic) => void }) {
  const items = sl ? TOPICS.filter(t => t.service_line === sl) : TOPICS
  if (items.length === 0) return <EmptyTopics />
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {items.map(t => {
        const m = CLASS_META[t.classification]
        const latest = t.activity_trend[t.activity_trend.length - 1].value
        const delta = momentum(t)
        const max = Math.max(...t.activity_trend.map(p => p.value), 1)
        return (
          <Card key={t.id} clickable onClick={() => onPick(t)} style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: `3px solid ${m.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Badge color={m.badge}>{m.label}</Badge>
              <Badge color="navy">{serviceLineLabel(t.service_line)}</Badge>
              {t.indegene_status === 'Gap' && <Badge color="amber">Gap</Badge>}
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.35, minHeight: 40 }}>{t.name}</div>

            {/* Big number + momentum */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div>
                <div style={{ fontSize: 30, fontWeight: 800, color: m.color, lineHeight: 1 }}>{latest}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.04em', marginTop: 2 }}>ACTIVITY INDEX</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>
                {delta >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}{delta >= 0 ? '+' : ''}{delta}
              </div>
            </div>

            {/* Mini bar trend — 4px rounded ends, 2px gaps, baseline-anchored */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44 }}>
              {t.activity_trend.map((p, i) => (
                <div key={i} title={`${p.period}: ${p.value}`} style={{ flex: 1, height: `${Math.max((p.value / max) * 100, 6)}%`, background: m.color, opacity: 0.35 + (i / (t.activity_trend.length - 1)) * 0.65, borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
              {t.driven_by.length ? `Driven by ${t.driven_by.join(', ')}` : 'No competitor clearly leading — open field.'}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function EmptyTopics() {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14, background: 'var(--bg-raised)', borderRadius: 12, border: '1px dashed var(--border)' }}>
      No topics in this service line yet. Clear the filter to see the full landscape.
    </div>
  )
}

function ContentIntelligence({ onPick }: { onPick: (sl: string, cls: Topic['classification']) => void }) {
  const classifications: Topic['classification'][] = ['Whitespace', 'Popular', 'Oversaturated']
  return (
    <Card style={{ padding: 20, overflowX: 'auto' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>Service line × market density heatmap</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Click a cell to see the topics behind it and what the density means.</div>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>Service line</th>
            {classifications.map(c => <th key={c} style={{ padding: 8, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {SERVICE_LINES.map(sl => (
            <tr key={sl.id}>
              <td style={{ padding: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{sl.label}</td>
              {classifications.map(cls => {
                const n = TOPICS.filter(t => t.service_line === sl.id && t.classification === cls).length
                const m = CLASS_META[cls]
                return (
                  <td key={cls} style={{ padding: 6, textAlign: 'center' }}>
                    <button onClick={() => onPick(sl.id, cls)} title={`${sl.label} · ${cls}: ${n} topic(s)`}
                      style={{ width: 56, height: 42, margin: '0 auto', borderRadius: 8, background: n ? m.color : 'var(--bg-raised)', opacity: n ? 0.25 + n * 0.28 : 1, color: n ? '#fff' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 120ms' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                      {n || '·'}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function TopicList({ filter, sl, onPick }: { filter: Topic['classification']; sl: string | null; onPick: (t: Topic) => void }) {
  const items = TOPICS.filter(t => t.classification === filter && (!sl || t.service_line === sl))
  if (items.length === 0) return <EmptyTopics />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(t => (
        <Card key={t.id} clickable onClick={() => onPick(t)} style={{ padding: 15, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: CLASS_META[t.classification].color, minWidth: 42, textAlign: 'center' }}>{t.activity_trend[t.activity_trend.length - 1].value}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{t.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{serviceLineLabel(t.service_line)} · {t.indegene_status === 'Gap' ? 'Company not yet active' : 'Company active'}</div>
          </div>
          <Badge color={t.indegene_status === 'Gap' ? 'amber' : 'emerald'}>{t.indegene_status}</Badge>
        </Card>
      ))}
    </div>
  )
}

function CompetitiveHeat({ onPick }: { onPick: (c: string) => void }) {
  const comps = Array.from(new Set(TOPICS.flatMap(t => t.driven_by)))
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
      {comps.map(c => {
        const topics = TOPICS.filter(t => t.driven_by.includes(c))
        return (
          <Card key={c} clickable onClick={() => onPick(c)}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>{c}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Active across {topics.length} topics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {topics.map(t => (
                <div key={t.id} style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: CLASS_META[t.classification].color }} /> {t.name}
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
