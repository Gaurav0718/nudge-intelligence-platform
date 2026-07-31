import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react'
import { SectionHeading, Card, MetricStat } from '../../components/shared/ui'
import AccountSelect, { type AccountOption } from './AccountSelect'
import { computeCXOSnapshot, INDEGENE_INTERNAL_SOURCE, type CXOSnapshot } from '../../lib/cxoSnapshot'
import type { OrganizationIntelligence } from '../../lib/orgIntelligence'
import type { OpenEvidence } from './homeTypes'

function IllustrativeTag() {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'var(--gold-light)', color: 'var(--gold-muted)', marginLeft: 6 }}>
      Illustrative
    </span>
  )
}

function Bar({ label, value, max, color, sub }: { label: string; value: number; max: number; color: string; sub: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4: 0): 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
        <span style={{ color: 'var(--text-3)' }}>{sub}</span>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: 'var(--navy-faint)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  )
}

export function CXOSnapshotGrid({ snapshot, accountName, data, openEvidence, onScrollTo, interactive = false }: {
  snapshot: CXOSnapshot
  accountName: string
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  onScrollTo?: (id: string) => void
  // Consolidated view: force a 3-across grid and make every tile open an
  // evidence drawer ("POP insight") with the numbers behind it.
  interactive?: boolean
}) {
  const TrendIcon = snapshot.financialHealth.trendDirection === 'up' ? TrendingUp: snapshot.financialHealth.trendDirection === 'down' ? TrendingDown: Minus
  const trendColor = snapshot.financialHealth.trendDirection === 'up' ? 'var(--navy)': snapshot.financialHealth.trendDirection === 'down' ? 'var(--gold-muted)': 'var(--text-3)'
  const maxPipelineQ = Math.max(...snapshot.pipeline.quarters.map(q => q.acvMillions), 1)
  const maxServiceLine = Math.max(...snapshot.serviceLineMix.map(r => r.engagementCount), 1)
  const openCard = (title: string, extra: Partial<Parameters<OpenEvidence>[2][number]>) => {
    openEvidence(accountName, title, [{
      id: `cxo:${snapshot.accountId}:${title}`, kind: 'signal', accountId: snapshot.accountId, accountName, accentColor: null,
      title, categoryLabel: 'Financial', sources: [], dateISO: null, ...extra,
    } as Parameters<OpenEvidence>[2][number]])
  }
  const cxoClick = interactive ? (fn: () => void) => fn : (_fn: () => void) => undefined

  return (
    <div style={{ display: 'grid', gridTemplateColumns: interactive ? 'repeat(3, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}
      className={interactive ? 'home-heads-up-grid' : undefined}>
        <Card clickable={interactive || !!onScrollTo}
          onClick={interactive
            ? () => openCard(`Financial Health — ${snapshot.financialHealth.latestValueLabel}`, {
                what_happened: snapshot.financialHealth.trendSummary,
                so_what: "The account's reported top-line direction is the backdrop for every expansion play — read against wallet share and service-line mix it shows where growth is actually landing.",
                connectedModules: [
                  { module: 'Financials', signal: `Reported trend ${snapshot.financialHealth.trendDirection} — ${snapshot.financialHealth.trendSummary}` },
                  { module: 'Sales & Growth', signal: `Only ~${snapshot.shareOfWallet.pct}% of the account's ${snapshot.shareOfWallet.accountRevenueLabel} spend is captured — headroom against the top line.` },
                  { module: 'Delivery', signal: snapshot.serviceLineMix.length ? `Engagement concentrated in ${snapshot.serviceLineMix[0].label} (${snapshot.serviceLineMix[0].pct}%).` : 'No active engagements tracked to anchor growth.' },
                ],
                factBlock: [{ label: 'Latest reported', value: snapshot.financialHealth.latestValueLabel }, { label: 'Direction', value: snapshot.financialHealth.trendDirection }],
                if_no_action: snapshot.financialHealth.trendDirection === 'down'
                  ? 'A declining top line typically triggers client cost optimization and vendor consolidation before it shows in the pipeline.'
                  : 'Rising client growth flows to whichever partner is positioned in the expanding service lines first.',
                nbas: [{
                  action: snapshot.financialHealth.trendDirection === 'down'
                    ? `Bring an efficiency/automation proposition to ${accountName} ahead of the cost-optimization cycle a declining top line signals.`
                    : `Map ${accountName}'s growth to the under-penetrated service lines and take an expansion proposition to the owning executive.`,
                  actor: 'Account Executive + service-line lead',
                  target: `${accountName} commercial leadership`,
                  whyNow: `Reported direction is ${snapshot.financialHealth.trendDirection} now — the mix required to serve it is shifting.`,
                  outcome: 'Company positioned in the service lines where the account\'s growth (or cost pressure) actually lands.',
                }],
                opportunity_or_risk: snapshot.financialHealth.trendDirection === 'down' ? 'Risk' : 'Opportunity',
              })
            : onScrollTo ? () => onScrollTo('home-quarters') : undefined}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <MetricStat label="Financial Health" value={snapshot.financialHealth.latestValueLabel} sub={snapshot.financialHealth.trendSummary} />
            <TrendIcon size={22} color={trendColor} />
          </div>
        </Card>

        <Card clickable={interactive}
          onClick={cxoClick(() => openCard('Pipeline — next 3 quarters', {
            what_happened: `${snapshot.pipeline.quarters.map(q => `${q.quarter}: $${q.acvMillions.toFixed(1)}M ACV across ${q.dealCount} deal${q.dealCount === 1 ? '' : 's'}`).join('. ')}.`,
            so_what: `$${snapshot.pipeline.totalAcvMillions.toFixed(1)}M ACV is tracked across the next three quarters — the near-term booking runway for this account.`,
            connectedModules: [
              { module: 'Sales & Growth', signal: `$${snapshot.pipeline.totalAcvMillions.toFixed(1)}M ACV tracked across 3 quarters; largest quarter carries the most weight.` },
              { module: 'Financials', signal: `Runway read against a ${snapshot.financialHealth.trendDirection} reported top line.` },
              { module: 'Sales & Growth', signal: `Only ~${snapshot.shareOfWallet.pct}% wallet share captured — expansion headroom sits behind this pipeline.` },
            ],
            factBlock: snapshot.pipeline.quarters.map(q => ({ label: q.quarter, value: `$${q.acvMillions.toFixed(1)}M · ${q.dealCount} deal${q.dealCount === 1 ? '' : 's'}` })),
            if_no_action: 'The near-term booking runway stays thin where wallet share is low, and expansion slips a quarter each time outreach lags the largest-ACV window.',
            nbas: [{
              action: `Sequence ${accountName} outreach against the quarter carrying the largest ACV, and pull the under-penetrated service lines into that motion.`,
              actor: 'Account Executive',
              target: `${accountName} buying committee`,
              whyNow: 'ACV is concentrated in a specific quarter — outreach lead-time is running now.',
              outcome: 'Largest-ACV quarter protected and expansion pipeline created against the wallet-share gap.',
            }],
            evidence_gaps: snapshot.pipeline.totalAcvMillions === 0 ? 'No ACV tracked for this account — pipeline runway not established from available evidence.' : undefined,
            opportunity_or_risk: 'Opportunity',
          }))}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Pipeline: next 3 quarters
          </div>
          {snapshot.pipeline.quarters.map(q => (
            <Bar key={q.quarter} label={q.quarter} value={q.acvMillions} max={maxPipelineQ} color="var(--navy)" sub={`$${q.acvMillions.toFixed(1)}M ACV · ${q.dealCount} deal${q.dealCount === 1 ? '': 's'}`} />
          ))}
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>${snapshot.pipeline.totalAcvMillions.toFixed(1)}M ACV tracked across the next 3 quarters.</div>
        </Card>

        <Card clickable={interactive}
          onClick={cxoClick(() => openCard('Win Rate · Loss % · Conversion %', {
            what_happened: `Win rate ${snapshot.rates.winRatePct}%, loss ${snapshot.rates.lossPct}%, conversion ${snapshot.rates.conversionPct}%${snapshot.rates.conversionIsReal ? ' (conversion from tracked pipeline)' : ''}.`,
            so_what: 'Conversion efficiency signals how much of the pipeline actually lands — the leverage point for where to spend account effort.',
            ai_hypothesis: snapshot.rates.conversionIsReal ? undefined : 'Win/loss figures are illustrative placeholders until internal CRM data is connected.',
            connectedModules: [
              { module: 'Sales & Growth', signal: `Win ${snapshot.rates.winRatePct}% / loss ${snapshot.rates.lossPct}% / conversion ${snapshot.rates.conversionPct}%.` },
              { module: 'Sales & Growth', signal: `Applied to $${snapshot.pipeline.totalAcvMillions.toFixed(1)}M tracked ACV, conversion sets how much actually books.` },
            ],
            factBlock: [{ label: 'Win rate', value: `${snapshot.rates.winRatePct}%` }, { label: 'Loss %', value: `${snapshot.rates.lossPct}%` }, { label: 'Conversion %', value: `${snapshot.rates.conversionPct}%` }],
            nbas: [{
              action: snapshot.rates.conversionIsReal
                ? `Focus ${accountName} effort on the stage where conversion drops most, reallocating from low-yield pursuits.`
                : `Connect internal CRM/pipeline data for ${accountName} so win/loss rates reflect actuals rather than illustrative placeholders.`,
              actor: snapshot.rates.conversionIsReal ? 'Account Executive' : 'RevOps + Account Executive',
              target: snapshot.rates.conversionIsReal ? `${accountName} pipeline stages` : 'Internal CRM integration',
              whyNow: snapshot.rates.conversionIsReal ? 'Conversion is the leverage point on the tracked ACV now.' : 'Decisions are being made on illustrative rates today.',
              outcome: snapshot.rates.conversionIsReal ? 'Higher booked rate on the same pipeline.' : 'Win/loss intelligence grounded in actuals.',
            }],
            evidence_gaps: snapshot.rates.conversionIsReal ? undefined : 'Win/loss/conversion are illustrative until internal CRM data is connected — not established from external evidence.',
          }))}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Win Rate · Loss % · Conversion %
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <div><MetricStat label="Win rate" value={`${snapshot.rates.winRatePct}%`} /><IllustrativeTag /></div>
            <div><MetricStat label="Loss %" value={`${snapshot.rates.lossPct}%`} /><IllustrativeTag /></div>
            <div>
              <MetricStat label="Conversion %" value={`${snapshot.rates.conversionPct}%`} />
              {snapshot.rates.conversionIsReal ? (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'var(--navy-faint)', color: 'var(--navy)', marginLeft: 6 }}>From tracked pipeline</span>
              ): <IllustrativeTag />}
            </div>
          </div>
        </Card>

        <Card clickable={interactive || !!snapshot.revenueConcentration.evidenceId}
          onClick={() => {
            const ev = snapshot.revenueConcentration.evidenceId ? data.evidenceById[snapshot.revenueConcentration.evidenceId] : null
            if (ev) { openEvidence(accountName, ev.title, [ev]); return }
            if (interactive) openCard('Revenue Concentration', {
              what_happened: snapshot.revenueConcentration.headline ?? 'No single-product concentration signal on file for this account.',
              so_what: 'High single-product concentration is both an opportunity (deep engagement need) and a risk (exposure if that product stumbles).',
              connectedModules: [
                { module: 'Financials', signal: snapshot.revenueConcentration.headline ?? 'No single-product concentration signal on file.' },
                { module: 'Delivery', signal: snapshot.serviceLineMix.length ? `Engagement concentrated in ${snapshot.serviceLineMix[0].label} (${snapshot.serviceLineMix[0].pct}%) — mirrors or hedges the franchise concentration.` : 'No active engagements to map against the franchise.' },
                { module: 'Sales & Growth', signal: `~${snapshot.shareOfWallet.pct}% wallet share — depth of coverage on the concentrated franchise is limited.` },
              ],
              if_no_action: snapshot.revenueConcentration.headline ? 'A concentrated franchise that stumbles takes the engagement with it; if it grows, a competitor deepens where Company is thin.' : undefined,
              nbas: [{
                action: `Map Company's ${accountName} service-line coverage against the concentrated franchise and take a depth-or-hedge proposition to the owning executive.`,
                actor: 'Account Executive + service-line lead',
                target: `${accountName} franchise owner`,
                whyNow: 'Concentration is a live exposure now — depth reduces both the risk and the competitive opening.',
                outcome: 'Coverage of the concentrated franchise deepened or hedged across a second service line.',
              }],
              evidence_gaps: snapshot.revenueConcentration.headline ? undefined : 'No single-product concentration signal on file — not established from available evidence.',
            })
          }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
            Revenue Concentration
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.5 }}>
            {snapshot.revenueConcentration.headline ?? 'No single-product concentration signal on file for this account.'}
          </div>
        </Card>

        <Card clickable={interactive}
          onClick={cxoClick(() => openCard('Share of Wallet', {
            what_happened: snapshot.shareOfWallet.comparisonSentence,
            so_what: `Account spend of ${snapshot.shareOfWallet.accountRevenueLabel} with only ~${snapshot.shareOfWallet.pct}% captured is the size of the expansion headroom.`,
            ai_hypothesis: 'Share-of-wallet is an internal Company estimate, not sourced external research.',
            connectedModules: [
              { module: 'Sales & Growth', signal: `~${snapshot.shareOfWallet.pct}% of ${snapshot.shareOfWallet.accountRevenueLabel} account spend captured.` },
              { module: 'Delivery', signal: snapshot.serviceLineMix.length ? `Coverage sits in ${snapshot.serviceLineMix.length} service line${snapshot.serviceLineMix.length === 1 ? '' : 's'}; the rest is uncovered headroom.` : 'No active engagements — the entire wallet is uncovered.' },
              { module: 'Financials', signal: `Headroom read against a ${snapshot.financialHealth.trendDirection} reported top line.` },
            ],
            factBlock: [{ label: 'Est. share captured', value: `${snapshot.shareOfWallet.pct}%` }, { label: 'Account revenue', value: snapshot.shareOfWallet.accountRevenueLabel }],
            if_no_action: 'The uncovered wallet stays open to competitors while Company\'s engagement concentrates in the lines it already holds.',
            nbas: [{
              action: `Target the largest uncovered service line at ${accountName} with a proposition anchored on the client's own growth, using an existing-line reference as proof.`,
              actor: 'Account Executive + service-line lead',
              target: `${accountName} owner of the largest uncovered service line`,
              whyNow: `Only ~${snapshot.shareOfWallet.pct}% captured — the headroom is largest and least contested now.`,
              outcome: 'Wallet share grown by opening one uncovered service line.',
            }],
            expected_outcome: 'A second/third service line opened at the account, lifting captured wallet share.',
            evidence_gaps: 'Share-of-wallet is an internal Company estimate, not sourced external research.',
            opportunity_or_risk: 'Opportunity',
            sources: [{ label: INDEGENE_INTERNAL_SOURCE.label, url: INDEGENE_INTERNAL_SOURCE.url }],
          }))}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
            Share of Wallet <IllustrativeTag />
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 600, lineHeight: 1.5, marginBottom: 8 }}>{snapshot.shareOfWallet.comparisonSentence}</div>
          <a href={INDEGENE_INTERNAL_SOURCE.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--navy)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {INDEGENE_INTERNAL_SOURCE.label} <ExternalLink size={11} />
          </a>
        </Card>

        <Card clickable={interactive}
          onClick={cxoClick(() => openCard('Service Line Mix', {
            what_happened: snapshot.serviceLineMix.length === 0 ? 'No active engagements tracked.' : snapshot.serviceLineMix.map(r => `${r.label}: ${r.pct}% (${r.engagementCount} engagement${r.engagementCount === 1 ? '' : 's'})`).join('. ') + '.',
            so_what: 'Where engagements concentrate today shows both the beachhead to defend and the lines with no presence to expand into.',
            connectedModules: [
              { module: 'Delivery', signal: snapshot.serviceLineMix.length ? `Engagements concentrate in ${snapshot.serviceLineMix[0].label} (${snapshot.serviceLineMix[0].pct}%) — the beachhead to defend.` : 'No active engagements tracked.' },
              { module: 'Sales & Growth', signal: `~${snapshot.shareOfWallet.pct}% wallet share — the lines with no presence are the expansion targets.` },
              { module: 'Competition', signal: 'Thin/absent service lines are where a competitor can enter uncontested.' },
            ],
            factBlock: snapshot.serviceLineMix.map(r => ({ label: r.label, value: `${r.pct}% · ${r.engagementCount}` })),
            if_no_action: snapshot.serviceLineMix.length ? 'The beachhead line is defensible, but the absent lines stay open to a competitor entering uncontested.' : 'With no tracked engagements, the whole account is open to a competitor establishing the beachhead first.',
            nbas: [{
              action: `Cross-reference ${accountName}'s thin/absent service lines against the open opportunity ledger and take the strongest white-space play to the owning executive.`,
              actor: 'Account Executive + service-line lead',
              target: `${accountName} owner of the strongest absent service line`,
              whyNow: 'The mix shows the gaps now; competitors enter through absent lines fastest.',
              outcome: 'One absent service line converted into an active engagement.',
            }],
          }))}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Service Line Mix
          </div>
          {snapshot.serviceLineMix.length === 0 ? <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No active engagements tracked.</div>: snapshot.serviceLineMix.map(r => (
            <Bar key={r.serviceLine} label={r.label} value={r.engagementCount} max={maxServiceLine} color="var(--gold-muted)" sub={`${r.pct}% · ${r.engagementCount} engagement${r.engagementCount === 1 ? '': 's'}`} />
          ))}
        </Card>

        <Card style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Big Bets &amp; Progress
          </div>
          <div className={interactive ? 'home-heads-up-grid' : undefined}
            style={{ display: 'grid', gridTemplateColumns: interactive ? 'repeat(3, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {snapshot.bigBets.map(bet => (
              <button key={bet.title} className="card-clickable home-hover"
                onClick={() => openEvidence(accountName, bet.title, [{
                  id: `bigbet:${snapshot.accountId}:${bet.title}`, kind: 'signal', accountId: snapshot.accountId, accountName, accentColor: null,
                  title: bet.title, categoryLabel: 'Big Bet',
                  what_happened: bet.body, so_what: bet.progressLabel,
                  opportunity_or_risk: 'Opportunity', urgency: bet.inMotion ? 'Medium': 'High',
                  priority: bet.inMotion ? 'Medium' : 'High',
                  connectedModules: [
                    { module: 'Sales & Growth', signal: bet.inMotion ? `First engagement already initiated on "${bet.title}".` : `No active engagement yet on "${bet.title}" — an unclaimed strategic bet.` },
                    { module: 'Market Intel', signal: bet.body },
                    { module: 'Delivery', signal: bet.inMotion ? 'Delivery footprint exists to build the proof point on.' : 'No delivery footprint yet to anchor the bet.' },
                  ],
                  if_no_action: bet.inMotion
                    ? `Momentum on "${bet.title}" leaks as the next milestone drifts without a named owner and date.`
                    : `"${bet.title}" stays a hypothesis while a competitor or the client's internal team acts on the same opening first.`,
                  nbas: [{
                    action: bet.inMotion
                      ? `Confirm the next milestone owner and date for "${bet.title}" with ${accountName}, tied to the revenue-conversion trigger.`
                      : `Put a "${bet.title}" point of view in front of ${accountName}'s decision-maker with a named first proof point — the bet has no active engagement yet.`,
                    actor: 'Company executive sponsor / bet owner',
                    target: `${accountName} decision-maker`,
                    whyNow: bet.inMotion ? 'Engagement is live — protect momentum before it cools.' : 'The bet is unclaimed now; first mover sets the frame.',
                    outcome: `"${bet.title}" advanced toward revenue conversion at ${accountName}.`,
                  }],
                  expected_outcome: `"${bet.title}" moved to its next stage with a named owner and date.`,
                  sources: [], dateISO: null,
                }])}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 12, textAlign: 'left', background: '#fff', cursor: 'pointer', display: 'block', width: '100%' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6, lineHeight: 1.35 }}>{bet.title}</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, display: 'inline-block', marginBottom: 6,
                  background: bet.inMotion ? 'var(--navy-faint)': 'var(--gold-light)', color: bet.inMotion ? 'var(--navy)': 'var(--gold-muted)',
                }}>
                  {bet.inMotion ? 'In motion': 'Not started'}
                </span>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{bet.progressLabel}</div>
              </button>
            ))}
          </div>
        </Card>
    </div>
  )
}

export default function CXOSnapshotBand({ data, openEvidence, onScrollTo }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  onScrollTo: (id: string) => void
}) {
  const accountOptions: AccountOption[] = useMemo(
    () => data.quarters.map(q => ({ id: q.accountId, label: q.accountName, color: q.accentColor })),
    [data.quarters],
  )
  const [accountId, setAccountId] = useState<string | null>(accountOptions[0]?.id ?? null)
  const snapshot = useMemo(() => accountId ? computeCXOSnapshot(data, accountId): null, [data, accountId])
  const accountName = accountOptions.find(a => a.id === accountId)?.label ?? ''

  if (!snapshot) return null

  return (
    <section id="home-cxo-snapshot">
      <SectionHeading eyebrow="5 · What a CXO sees first" title="Financial & Growth Snapshot"
        sub="Every number below is a comparison, not a raw figure: the doc's own rule: a $31bn account means nothing without knowing what share of it we actually have."
        right={<AccountSelect options={accountOptions} value={accountId} onChange={setAccountId} allowAll={false} />} />
      <CXOSnapshotGrid snapshot={snapshot} accountName={accountName} data={data} openEvidence={openEvidence} onScrollTo={onScrollTo} />
    </section>
  )
}
