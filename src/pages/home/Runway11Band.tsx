import { useMemo, useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { SectionHeading, Card, EmptyState } from '../../components/shared/ui'
import AccountSelect, { type AccountOption } from './AccountSelect'
import { DOSSIERS } from '../../data/accounts.seed'
import { RELATIONSHIP_META, accountOwner, primaryAccountExec } from '../../lib/connectedIntelligence'
import type { OrganizationIntelligence } from '../../lib/orgIntelligence'
import type { OpenEvidence } from './homeTypes'

function depthOf(id: string, byId: Map<string, { parent_id: string | null }>): number {
  let d = 0, cur = byId.get(id)
  while (cur?.parent_id) { d++; cur = byId.get(cur.parent_id); if (d > 8) break }
  return d
}

export function Runway11Grid({ accountId, data, openEvidence, hideOrgChart = false }: {
  accountId: string | null
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  // Merged into Leadership Intelligence: the exec cards already carry the
  // relationship tags, so the org-chart panel is dropped to avoid a duplicate,
  // potentially-confusing second roster of the same people.
  hideOrgChart?: boolean
}) {
  const dossier = accountId ? DOSSIERS.find(d => d.account_id === accountId): null
  const org = dossier?.org ?? []
  const byId = new Map(org.map(o => [o.id, o]))
  const sortedOrg = org.slice().sort((a, b) => depthOf(a.id, byId) - depthOf(b.id, byId))

  const owner = accountId ? accountOwner(accountId): null
  const openOpps = data.opportunityLedger.open.filter(o => o.accountId === accountId).slice(0, 5)
  const primaryExec = accountId ? primaryAccountExec(accountId): null
  const accountName = data.quarters.find(q => q.accountId === accountId)?.accountName ?? ''

  return (
      <div style={{ display: 'grid', gridTemplateColumns: hideOrgChart ? '1fr' : '1fr 1fr', gap: 14 }} className="home-drawer-goodbad">
        {!hideOrgChart && (
        <Card>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
            Executive Mapping &amp; Relationship Intelligence
          </div>
          {sortedOrg.length === 0 ? <EmptyState title="No org chart on file" />: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sortedOrg.map(p => {
                const meta = RELATIONSHIP_META[p.relationship]
                return (
                  <button key={p.id} className="home-hover"
                    onClick={() => openEvidence(accountName, p.name, [{
                      id: `orgperson:${accountId}:${p.id}`, kind: 'executive', accountId, accountName, accentColor: null,
                      title: p.name, categoryLabel: 'Leadership',
                      what_happened: `${p.title}. Working relationship: ${meta.label}.`,
                      who: { name: p.name, role: p.title },
                      sources: [], dateISO: null,
                    }])}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', marginLeft: depthOf(p.id, byId) * 18, width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-1)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.title}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: meta.bg, color: meta.color, flexShrink: 0 }}>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
        )}

        <div style={{ display: hideOrgChart ? 'grid' : 'flex', gridTemplateColumns: hideOrgChart ? '1fr 1fr' : undefined, flexDirection: 'column', gap: 14, alignItems: 'start' }} className="home-drawer-goodbad">
          <Card>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              Opportunity Mapping &amp; Ownership
            </div>
            {openOpps.length === 0 ? <EmptyState title="No open opportunities mapped" />: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {openOpps.map(o => (
                  <button key={o.evidenceId} onClick={() => { const ev = data.evidenceById[o.evidenceId]; if (ev) openEvidence(o.accountName, ev.title, [ev]) }}
                    className="home-hover" style={{ display: 'flex', justifyContent: 'space-between', gap: 10, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 8px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-1)', lineHeight: 1.4 }}>{o.title}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--gold-muted)', fontWeight: 700, flexShrink: 0 }}>{owner ?? 'Unassigned'}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              Preferences {primaryExec ? `: ${primaryExec.name}`: ''}
            </div>
            {!primaryExec ? <EmptyState title="No relationship preferences on file" />: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {primaryExec.sales_do.slice(0, 2).map(d => (
                  <div key={d} style={{ display: 'flex', gap: 6, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4 }}>
                    <ThumbsUp size={12} color="var(--navy)" style={{ flexShrink: 0, marginTop: 2 }} />{d}
                  </div>
                ))}
                {primaryExec.sales_dont.slice(0, 2).map(d => (
                  <div key={d} style={{ display: 'flex', gap: 6, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4 }}>
                    <ThumbsDown size={12} color="var(--gold-muted)" style={{ flexShrink: 0, marginTop: 2 }} />{d}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
  )
}

export default function Runway11Band({ data, openEvidence }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
}) {
  const accountOptions: AccountOption[] = useMemo(
    () => data.quarters.map(q => ({ id: q.accountId, label: q.accountName, color: q.accentColor })),
    [data.quarters],
  )
  const [accountId, setAccountId] = useState<string | null>(accountOptions[0]?.id ?? null)

  return (
    <section id="home-runway11">
      <SectionHeading eyebrow="12 · Resurfaced" title="Runway 11 Intelligence"
        sub="Opportunity mapping, executive mapping, preferences, opportunity ownership, relationship intelligence: on the summary page, not hidden."
        right={<AccountSelect options={accountOptions} value={accountId} onChange={setAccountId} allowAll={false} />} />
      <Runway11Grid accountId={accountId} data={data} openEvidence={openEvidence} />
    </section>
  )
}
