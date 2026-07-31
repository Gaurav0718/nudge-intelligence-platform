import { useState } from 'react'
import { ExternalLink, Clock } from 'lucide-react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import ServiceLineSelector from '../../components/shared/ServiceLineSelector'
import { SectionHeading, Card, Badge, AccentCallout } from '../../components/shared/ui'
import DetailModal, { ModalSection } from '../../components/shared/DetailModal'
import { INTELLIGENCE_CARDS, COMPETITOR_NAMES, cardSource, type IntelligenceCard } from '../../data/marketing.seed'
import { SERVICE_LINES, serviceLineLabel } from '../../data/shared'
import { MARKETING_TABS } from './marketingTabs'

export default function ExecutiveAiSummaryPage() {
  const [sl, setSl] = useState<string | null>(null)
  const [comp, setComp] = useState<string | null>(null)
  const [active, setActive] = useState<IntelligenceCard | null>(null)

  const cards = INTELLIGENCE_CARDS.filter(c =>
    (!sl || c.service_line === sl) && (!comp || c.competitor === comp))

  const activeComps = Array.from(new Set(INTELLIGENCE_CARDS.map(c => c.competitor)))

  return (
    <div>
      <SectionHeading eyebrow="Marketing & Service Line" title="Executive AI Summary"
        sub="AI-curated competitive intelligence across the six service lines and the competitive field — each card carries what it means for Company and a next best move." />
      <ModuleTabBar tabs={MARKETING_TABS} />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <ServiceLineSelector label="SERVICE LINE" allLabel="All service lines"
          options={SERVICE_LINES} value={sl} onChange={setSl} />
        <ServiceLineSelector label="COMPETITOR" allLabel="All competitors"
          options={activeComps.map(c => ({ id: c, label: c }))} value={comp} onChange={setComp} />
        {(sl || comp) && (
          <button onClick={() => { setSl(null); setComp(null) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', background: 'var(--navy-faint)', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
            Clear filters
          </button>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--text-3)' }}>
          {cards.length} of {INTELLIGENCE_CARDS.length} cards · {activeComps.length} competitors active · {COMPETITOR_NAMES.length} tracked
        </div>
      </div>

      {cards.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14, background: 'var(--bg-raised)', borderRadius: 12, border: '1px dashed var(--border)' }}>
          No intelligence cards match this filter combination. Clear a filter to widen the view.
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {cards.map(c => (
          <Card key={c.id} clickable onClick={() => setActive(c)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Badge color="navy">{c.competitor}</Badge>
              <Badge color="gold">{serviceLineLabel(c.service_line)}</Badge>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{c.published_at}</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.35 }}>{c.headline}</div>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{c.summary}</p>
            <AccentCallout tone="navy" label="What this means">{c.what_this_means}</AccentCallout>
            <AccentCallout tone="gold" label="Next best move">
              {c.next_best_move}
              {c.next_best_move_deadline_hint && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11.5, fontWeight: 700, color: 'var(--gold-muted)' }}>
                  <Clock size={12} /> {c.next_best_move_deadline_hint}
                </div>
              )}
            </AccentCallout>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {c.tags.map(t => <span key={t} style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-raised)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>{t}</span>)}
              <a href={cardSource(c).url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{c.reference_label} <ExternalLink size={11} /></a>
            </div>
          </Card>
        ))}
      </div>
      )}

      {active && (
        <DetailModal eyebrow={`${serviceLineLabel(active.service_line)} · Competitive intelligence`} title={active.headline}
          onClose={() => setActive(null)} sourceLabel={cardSource(active).label} sourceUrl={cardSource(active).url}
          badges={<>
            <Badge color="navy">{active.competitor}</Badge>
            <Badge color="gold">{serviceLineLabel(active.service_line)}</Badge>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)', alignSelf: 'center' }}>{active.published_at}</span>
          </>}>
          <ModalSection label="Summary">{active.summary}</ModalSection>
          <ModalSection label="What this means for Company">{active.what_this_means}</ModalSection>
          <ModalSection label="Next best move">
            {active.next_best_move}
            {active.next_best_move_deadline_hint && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--gold-muted)' }}>
                <Clock size={13} /> {active.next_best_move_deadline_hint}
              </div>
            )}
          </ModalSection>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {active.tags.map(t => <Badge key={t} color="navy">{t}</Badge>)}
          </div>
        </DetailModal>
      )}
    </div>
  )
}
