import { useState } from 'react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import { SectionHeading, Card, MetricStat, Badge } from '../../components/shared/ui'
import DetailModal, { ModalSection } from '../../components/shared/DetailModal'
import { TOPICS } from '../../data/marketing.seed'
import { SERVICE_LINES, serviceLineLabel } from '../../data/shared'
import { MARKETING_TABS } from './marketingTabs'

export default function InsideIndegenePage() {
  const [sel, setSel] = useState<string | null>(null)
  const byLine = SERVICE_LINES.map(sl => {
    const topics = TOPICS.filter(t => t.service_line === sl.id)
    const active = topics.filter(t => t.indegene_status === 'Active').length
    const gaps = topics.filter(t => t.indegene_status === 'Gap')
    return { sl, topics, active, gaps }
  })
  const totalActive = TOPICS.filter(t => t.indegene_status === 'Active').length
  const totalGaps = TOPICS.filter(t => t.indegene_status === 'Gap').length

  return (
    <div>
      <SectionHeading eyebrow="Marketing & Service Line" title="Inside Company"
        sub="Company's own service-line footprint against the live market — coverage where we're active, and the whitespace gaps worth closing." />
      <ModuleTabBar tabs={MARKETING_TABS} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 22 }}>
        <Card><MetricStat label="Service lines" value={SERVICE_LINES.length} /></Card>
        <Card><MetricStat label="Topics active in" value={totalActive} color="var(--navy)" /></Card>
        <Card><MetricStat label="Open gaps" value={totalGaps} color="var(--navy)" sub="whitespace to close" /></Card>
        <Card><MetricStat label="Coverage" value={`${Math.round((totalActive / TOPICS.length) * 100)}%`} /></Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {byLine.map(({ sl, topics, active, gaps }) => (
          <Card key={sl.id} clickable onClick={() => setSel(sl.id)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{sl.label}</div>
              <span className="badge badge-gold">{active}/{topics.length} active</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-raised)', overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: `${(active / (topics.length || 1)) * 100}%`, height: '100%', background: 'var(--navy)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topics.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.indegene_status === 'Active' ? 'var(--emerald)' : 'var(--amber)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-2)', flex: 1 }}>{t.name}</span>
                  {t.indegene_status === 'Gap' && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--amber)' }}>GAP</span>}
                </div>
              ))}
            </div>
            {gaps.length > 0 && <div style={{ fontSize: 11.5, color: 'var(--amber)', marginTop: 10, fontWeight: 600 }}>{gaps.length} whitespace gap{gaps.length > 1 ? 's' : ''} to pursue</div>}
          </Card>
        ))}
      </div>

      {sel && (() => {
        const line = byLine.find(b => b.sl.id === sel)!
        const cov = Math.round((line.active / (line.topics.length || 1)) * 100)
        return (
          <DetailModal eyebrow="Inside Company · Service line" title={line.sl.label} onClose={() => setSel(null)}
            sourceLabel="Company Market Scan" sourceUrl="https://www.indegene.com/what-we-think"
            badges={<>
              <Badge color="gold">{line.active}/{line.topics.length} active</Badge>
              <Badge color={line.gaps.length ? 'amber' : 'emerald'}>{cov}% coverage</Badge>
            </>}>
            <ModalSection label="Where Company stands">
              Company is active in {line.active} of {line.topics.length} tracked {line.sl.label} topics ({cov}% coverage){line.gaps.length ? `, with ${line.gaps.length} open whitespace gap${line.gaps.length > 1 ? 's' : ''} still to close.` : ' — full coverage of the tracked field.'}
            </ModalSection>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>Topics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {line.topics.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.indegene_status === 'Active' ? 'var(--emerald)' : 'var(--amber)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{t.name}</span>
                  <Badge color={t.indegene_status === 'Gap' ? 'amber' : 'emerald'}>{t.indegene_status}</Badge>
                </div>
              ))}
            </div>
            {line.gaps.length > 0 && <ModalSection label="Gaps worth closing">
              {line.gaps.map(g => g.name).join('; ')}. These are whitespace topics where Company is not yet active in {serviceLineLabel(line.sl.id)} — prime targets for a first-mover play.
            </ModalSection>}
          </DetailModal>
        )
      })()}
    </div>
  )
}
