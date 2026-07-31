import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Check, X } from 'lucide-react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import { SectionHeading, Card, Badge } from '../../components/shared/ui'
import DetailModal, { ModalSection } from '../../components/shared/DetailModal'
import { NEXT_BEST_ACTIONS, INTELLIGENCE_CARDS, nbaSource, type NextBestAction } from '../../data/marketing.seed'
import { serviceLineLabel } from '../../data/shared'
import { promoteToInitiative, allInitiatives } from '../../lib/initiatives'
import { useToast } from '../../hooks/useToast'
import ToastHost from '../../components/shared/ToastHost'
import { MARKETING_TABS } from './marketingTabs'

const PRIORITY_META = { high: { badge: 'red', label: 'High' }, medium: { badge: 'amber', label: 'Medium' }, low: { badge: 'navy', label: 'Low' } } as const

export default function NextBestActionPage() {
  const nav = useNavigate()
  const { toasts, push } = useToast()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [detail, setDetail] = useState<NextBestAction | null>(null)
  const [, force] = useState(0)

  const converted = (id: string) => allInitiatives().some(i => i.source_id === id)

  const promote = (nba: typeof NEXT_BEST_ACTIONS[number]) => {
    promoteToInitiative(nba.id, {
      title: nba.headline, status: 'NotStarted', module: 'MarketingServiceLine',
      source_type: 'NextBestActionRecommendation', description: nba.recommendation_text,
      service_line: nba.service_line, account_id: null,
    })
    push('Promoted to Execution Workspace', 'success')
    force(x => x + 1)
  }

  const active = NEXT_BEST_ACTIONS.filter(n => !dismissed.has(n.id))

  return (
    <div>
      <ToastHost toasts={toasts} />
      <SectionHeading eyebrow="Marketing & Service Line" title="Next Best Action"
        sub="AI-recommended commercial moves derived from the intelligence feed. Promote one into the Execution Workspace to turn it into a tracked initiative." />
      <ModuleTabBar tabs={MARKETING_TABS} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {active.map(nba => {
          const p = PRIORITY_META[nba.priority]
          const card = nba.source_card_id ? INTELLIGENCE_CARDS.find(c => c.id === nba.source_card_id) : null
          const isConverted = converted(nba.id)
          return (
            <Card key={nba.id} style={{ borderLeft: `3px solid ${nba.priority === 'high' ? 'var(--red)' : nba.priority === 'medium' ? 'var(--amber)' : 'var(--navy)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <Badge color={p.badge as any}>{p.label} priority</Badge>
                    <Badge color="gold">{serviceLineLabel(nba.service_line)}</Badge>
                    {isConverted && <Badge color="emerald">In workspace</Badge>}
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>{nba.headline}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{nba.recommendation_text}</p>
                  {card && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 6 }}>Source: {card.competitor} — {card.headline.slice(0, 60)}…</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-navy" onClick={() => promote(nba)} disabled={isConverted} style={{ opacity: isConverted ? 0.6 : 1 }}>
                  <ArrowUpRight size={14} /> {isConverted ? 'Promoted' : 'Promote to workspace'}
                </button>
                {isConverted && <button className="btn btn-ghost" onClick={() => nav('/marketing/execution-workspace')}><Check size={14} /> View in workspace</button>}
                <button className="btn btn-ghost" onClick={() => setDetail(nba)}>Details &amp; source</button>
                <button className="btn btn-ghost" onClick={() => { setDismissed(s => new Set(s).add(nba.id)); push('Dismissed', 'info') }}><X size={14} /> Dismiss</button>
              </div>
            </Card>
          )
        })}
      </div>

      {detail && (() => {
        const card = detail.source_card_id ? INTELLIGENCE_CARDS.find(c => c.id === detail.source_card_id) : null
        return (
          <DetailModal eyebrow={`${serviceLineLabel(detail.service_line)} · Next best action`} title={detail.headline}
            onClose={() => setDetail(null)} sourceLabel={nbaSource(detail).label} sourceUrl={nbaSource(detail).url}
            badges={<>
              <Badge color={PRIORITY_META[detail.priority].badge as any}>{PRIORITY_META[detail.priority].label} priority</Badge>
              <Badge color="gold">{serviceLineLabel(detail.service_line)}</Badge>
            </>}>
            <ModalSection label="Recommended move">{detail.recommendation_text}</ModalSection>
            {card && <ModalSection label="Triggering signal">{card.competitor} — {card.headline}. {card.what_this_means}</ModalSection>}
            <ModalSection label="How to action it">
              Promote this into the Execution Workspace to convert it into a tracked initiative with an owner, status and checklist.
            </ModalSection>
          </DetailModal>
        )
      })()}
    </div>
  )
}
