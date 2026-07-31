import { Fragment, useMemo } from 'react'
import { ArrowRight, Compass, Target } from 'lucide-react'
import { SectionHeading, ExpandableInsightCard, AccentCallout, EmptyState } from '../../components/shared/ui'
import { Bullets } from '../../components/shared/Bullets'
import { computeConnectedChains, type ChainNode, type ConnectedChain } from '../../lib/connectedIntelligence'
import type { OrganizationIntelligence } from '../../lib/orgIntelligence'
import type { OpenEvidence } from './homeTypes'

const NODE_TONE: Record<ChainNode['kind'], { bg: string; fg: string }> = {
  Delivery: { bg: 'var(--navy-faint)', fg: 'var(--navy)' },
  Competitive: { bg: 'var(--gold-light)', fg: 'var(--gold-muted)' },
  Whitespace: { bg: 'var(--navy-faint)', fg: 'var(--navy)' },
}

function NodeCard({ node, onOpen }: { node: ChainNode; onOpen: () => void }) {
  const tone = NODE_TONE[node.kind]
  return (
    <button onClick={onOpen} className="card card-clickable home-hover"
      style={{ flex: '1 1 220px', minWidth: 200, textAlign: 'left', padding: 14, display: 'flex', flexDirection: 'column', gap: 6, background: '#ffffff' }}>
      <span style={{ display: 'inline-flex', alignSelf: 'flex-start', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 999, background: tone.bg, color: tone.fg }}>
        {node.badge}
      </span>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.35 }}>{node.headline}</div>
      <Bullets items={node.detail} compact style={{ marginTop: 2 }} />
    </button>
  )
}

export function ChainBody({ chain, openEvidence }: { chain: ConnectedChain; openEvidence: OpenEvidence }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, flexWrap: 'wrap', margin: '12px 0 16px' }}>
        {chain.nodes.map((node, ni) => (
          <Fragment key={node.evidenceItem.id}>
            {ni > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)', flex: '0 0 auto' }}>
                <ArrowRight size={16} />
              </span>
            )}
            <NodeCard node={node}
              onOpen={() => openEvidence(chain.accountName, node.evidenceItem.title, [node.evidenceItem])} />
          </Fragment>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="home-drawer-goodbad">
        <AccentCallout label="Why it matters" tone="navy" icon={<Compass size={12} />}><Bullets items={chain.soWhat} /></AccentCallout>
        <AccentCallout label="Next Best Action" tone="gold" icon={<Target size={12} />}><Bullets items={chain.nextBestAction} /></AccentCallout>
      </div>
    </>
  )
}

export default function ConnectedIntelligenceBand({ data, openEvidence }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
}) {
  const chains = useMemo(() => computeConnectedChains(data), [data])

  return (
    <section id="home-connected">
      <SectionHeading eyebrow="2 · Cause and effect" title="Connected Intelligence"
        sub="Signals rarely arrive alone. Each chain below fuses Delivery Health, Competition, and Marketing whitespace for one account into a single narrative: with an explicit Why It Matters and Next Best Action." />

      {chains.length === 0 ? <EmptyState title="No cross-module chains available" />: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {chains.map((chain, i) => (
            <ExpandableInsightCard key={chain.accountId} defaultOpen={i === 0}
              headerClassName="home-hover"
              title={<span>{chain.accountName} <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>: {chain.headline}</span></span>}
              meta={chain.bigBetTitle ? `Big bet in play: ${chain.bigBetTitle}`: undefined}
              badge={<span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'var(--gold-light)', color: 'var(--gold-muted)' }}>{chain.confidence} confidence</span>}>
              <ChainBody chain={chain} openEvidence={openEvidence} />
            </ExpandableInsightCard>
          ))}
        </div>
      )}
    </section>
  )
}
