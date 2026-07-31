import { useMemo, useState } from 'react'
import { SectionHeading, Card, EmptyState } from '../../components/shared/ui'
import { SlopeGraph, QuarterLineChart } from './charts'
import AccountSelect, { type AccountOption } from './AccountSelect'
import type { OrganizationIntelligence, EvidenceItem } from '../../lib/orgIntelligence'
import type { OpenEvidence } from './homeTypes'

export const RANK: Record<string, number> = { High: 3, Medium: 2, Low: 1 }

export function InsightsList({ items, forLabel, openEvidence }: { items: EvidenceItem[]; forLabel?: string; openEvidence: OpenEvidence }) {
  return (
    <>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 10 }}>
        Top Insights{forLabel ? ` for ${forLabel}`: ''}
      </div>
      {items.length === 0 ? <EmptyState title="No financial signals" />: (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <li key={item.id}>
              <button onClick={() => openEvidence(item.accountName ?? '', item.title, [item])} className="home-hover"
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold-muted)', marginBottom: 1 }}>{item.accountName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.ai_hypothesis}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function QuarterTrendBand({ data, openEvidence }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
}) {
  const accountOptions: AccountOption[] = useMemo(
    () => data.quarters.map(q => ({ id: q.accountId, label: q.accountName, color: q.accentColor })),
    [data.quarters],
  )
  const [detailAccount, setDetailAccount] = useState<string | null>(accountOptions[0]?.id ?? null)

  const financialInsights = useMemo(() => Object.values(data.evidenceById)
    .filter(e => e.categoryLabel === 'Financial' && e.ai_hypothesis)
    .sort((a, b) => (RANK[b.urgency ?? 'Low'] * 3 + RANK[b.confidence ?? 'Low']) - (RANK[a.urgency ?? 'Low'] * 3 + RANK[a.confidence ?? 'Low']))
    .slice(0, 5), [data.evidenceById])

  const accountFinancialInsights = useMemo(() => Object.values(data.evidenceById)
    .filter(e => e.categoryLabel === 'Financial' && e.ai_hypothesis && e.accountId === detailAccount)
    .sort((a, b) => (RANK[b.urgency ?? 'Low'] * 3 + RANK[b.confidence ?? 'Low']) - (RANK[a.urgency ?? 'Low'] * 3 + RANK[a.confidence ?? 'Low']))
    .slice(0, 5), [data.evidenceById, detailAccount])

  const detailFacet = data.quarters.find(q => q.accountId === detailAccount)

  return (
    <section id="home-quarters">
      <SectionHeading eyebrow="Momentum" title="Quarterly Trend"
        sub="QoQ revenue-growth momentum across the portfolio, then a per-account deep dive." />

      <Card style={{ padding: '22px 26px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', minWidth: 320, maxWidth: 460 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>QoQ Momentum</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, marginBottom: 8 }}>Revenue growth %, prior quarter → current quarter</div>
            <SlopeGraph momentum={data.momentum} evidenceById={data.evidenceById} openEvidence={openEvidence} />
          </div>
          <div style={{ flex: '1 1 260px', minWidth: 240, borderLeft: '1px solid var(--border)', paddingLeft: 22, display: 'flex', flexDirection: 'column' }}>
            <InsightsList items={financialInsights} openEvidence={openEvidence} />
          </div>
        </div>
      </Card>

      <Card style={{ padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Account Deep Dive</div>
          <AccountSelect options={accountOptions} value={detailAccount} onChange={setDetailAccount} allowAll={false} />
        </div>
        {!detailFacet ? <EmptyState title="No quarterly data available" />: (
          <div style={{ display: 'flex', gap: 24, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 460px', minWidth: 340, maxWidth: 560 }}>
              <QuarterLineChart facet={detailFacet} evidenceById={data.evidenceById} openEvidence={openEvidence} bare />
            </div>
            <div style={{ flex: '1 1 260px', minWidth: 240, borderLeft: '1px solid var(--border)', paddingLeft: 22, display: 'flex', flexDirection: 'column' }}>
              <InsightsList items={accountFinancialInsights} forLabel={detailFacet.accountName} openEvidence={openEvidence} />
            </div>
          </div>
        )}
      </Card>
    </section>
  )
}
