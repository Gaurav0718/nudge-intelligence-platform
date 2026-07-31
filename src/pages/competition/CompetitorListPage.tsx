import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import ServiceLineSelector from '../../components/shared/ServiceLineSelector'
import { Badge, SectionHeading, AvatarInitials } from '../../components/shared/ui'
import { COMPETITORS, COMP_SERVICE_LINES, SIGNALS, researchedCount } from '../../data/competition.seed'

export const COMPETITION_TABS = [
  { label: 'Competitor Intelligence', path: '/competition' },
  { label: 'Signal Feed', path: '/competition/signals' },
  { label: 'Strategic Radar', path: '/competition/radar' },
]

const THREAT_COLOR: Record<string, string> = { High: 'red', Medium: 'amber', Watch: 'navy' }

export default function CompetitorListPage() {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [sl, setSl] = useState<string | null>(null)

  const filtered = COMPETITORS.filter(c => {
    const q = query.trim().toLowerCase()
    const matchesQ = !q || c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
    const matchesSl = !sl || c.mapped_service_lines.includes(sl)
    return matchesQ && matchesSl
  })
  const signalCount = (id: string) => SIGNALS.filter(s => s.competitor_id === id).length

  return (
    <div>
      <SectionHeading eyebrow="Competition Module" title="Competitor Intelligence"
        sub="Strategic synthesis of competitor posture, moves, positioning and signals across Company's service lines." />
      <ModuleTabBar tabs={COMPETITION_TABS} />

      {/* Filter bar — outside the tab bar so the dropdown is never clipped */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search competitors…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 13.5, background: 'var(--bg-surface)', color: 'var(--text-1)' }} />
        </div>
        <ServiceLineSelector
          options={COMP_SERVICE_LINES.map(s => ({ id: s, label: s }))}
          value={sl} onChange={setSl} allLabel="All service lines" />
        <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--text-3)' }}>
          {filtered.length} of {COMPETITORS.length} competitors{sl ? ` · ${sl}` : ''} · {researchedCount()} researched
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14, background: 'var(--bg-raised)', borderRadius: 12, border: '1px dashed var(--border)' }}>
          No competitors match “{query}”{sl ? ` in ${sl}` : ''}.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18, alignItems: 'stretch' }}>
          {filtered.map(c => (
            <div key={c.id} className="card card-clickable" onClick={() => nav(`/competition/${c.id}`)}
              style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AvatarInitials text={c.name} color="var(--navy)" size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)' }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{c.hq}</div>
                </div>
                {c.threat_level && <Badge color={THREAT_COLOR[c.threat_level] as any}>{c.threat_level} threat</Badge>}
              </div>

              {/* Description — clamped so every card is the same shape */}
              <p style={{
                fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, margin: 0,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{c.description}</p>

              {/* Scale + signal count */}
              <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--text-3)' }}>
                <span>{c.scale}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--navy)' }}>{signalCount(c.id)} signals</span>
              </div>

              {/* Service-line tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 24 }}>
                {c.mapped_service_lines.slice(0, 4).map(s => (
                  <span key={s} style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--navy-faint)', color: 'var(--navy)' }}>{s}</span>
                ))}
                {c.mapped_service_lines.length > 4 && <span style={{ fontSize: 10.5, color: 'var(--text-3)', alignSelf: 'center' }}>+{c.mapped_service_lines.length - 4}</span>}
              </div>

              {/* Footer pinned to the bottom → uniform card height */}
              <div style={{ marginTop: 'auto', paddingTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                View synthesis <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
