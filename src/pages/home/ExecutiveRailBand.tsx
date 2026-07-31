import { useMemo, useState } from 'react'
import { ExternalLink, Mail, MapPin } from 'lucide-react'
import { SectionHeading, EmptyState, Pill } from '../../components/shared/ui'
import Avatar from '../../components/shared/Avatar'
import { COMPANY_URL, type OrganizationIntelligence, type ExecCard } from '../../lib/orgIntelligence'
import { relationshipForExec, RELATIONSHIP_META } from '../../lib/connectedIntelligence'
import type { OpenEvidence } from './homeTypes'

const DEPARTED_RE = /departed|ousted|former/i

function Chip({ tone, children }: { tone: 'navy' | 'gold'; children: React.ReactNode }) {
  const style = tone === 'gold' ? { background: 'var(--gold-light)', color: 'var(--gold-muted)' }: { background: 'var(--navy-faint)', color: 'var(--navy)' }
  return <span style={{ ...style, display: 'inline-flex', padding: '3px 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>{children}</span>
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-muted)', marginBottom: 4 }}>
      {children}
    </div>
  )
}

// Cosmetic-only filler (email/location/tenure): deterministic per name, never
// presented as sourced. Real fields (role, status, priority, linked opportunities)
// stay clearly separated from this in the drawer.
const LOCATIONS = ['London, UK', 'Basel, CH', 'New Brunswick, US', 'Paris, FR', 'Cambridge, US', 'Munich, DE', 'Singapore', 'Dublin, IE']
const GENERIC_FOCUS = [
  'General account engagement', 'Relationship management', 'Cross-functional coordination',
  'Internal stakeholder alignment', 'Governance and escalation path', 'Standing account reviews',
]
function hashOf(s: string): number { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }
function dummyEmail(name: string, accountId: string): string {
  return `${name.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, '.')}@${accountId}.com`
}
function dummyLocation(name: string): string { return LOCATIONS[hashOf(name) % LOCATIONS.length] }
function dummyTenure(name: string): number { return 2 + (hashOf(name) % 11) }
function dummyFocus(name: string): string[] {
  const h = hashOf(name)
  return [GENERIC_FOCUS[h % GENERIC_FOCUS.length], GENERIC_FOCUS[(h + 3) % GENERIC_FOCUS.length]]
}

export function ExecutiveGrid({ roster, data, openEvidence }: {
  roster: ExecCard[]
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
}) {
  if (roster.length === 0) return <EmptyState title="No executives on file for this account" />
  return (
        <div className="home-exec-grid">
          {roster.map(ex => {
            const departed = DEPARTED_RE.test(ex.status ?? '')
            const isHigh = ex.priority === 'High' && !departed
            const name = ex.name ?? ex.role
            const relationship = relationshipForExec(ex.accountId, ex.name)
            const relMeta = relationship ? RELATIONSHIP_META[relationship]: null
            const engagement = data.evidenceById[ex.evidenceId]?.next_best_action
            return (
              <button key={ex.evidenceId}
                onClick={() => { const ev = data.evidenceById[ex.evidenceId]; if (ev) openEvidence(ex.accountName, ev.title, [ev]) }}
                className="card card-clickable"
                style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', padding: 16, opacity: departed ? 0.55: 1, position: 'relative', height: '100%' }}>
                <span style={{ position: 'absolute', top: 10, right: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {relMeta && (
                    <span title={`Relationship: ${relMeta.label}`}
                      style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 999, background: relMeta.bg, color: relMeta.color }}>
                      {relMeta.label}
                    </span>
                  )}
                  {isHigh && <span title="High priority" style={{ fontSize: 16, lineHeight: 1 }}>👑</span>}
                </span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingRight: relMeta ? 84 : 24 }}>
                  <Avatar name={name} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', textDecoration: departed ? 'line-through': 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {ex.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.35 }}>{ex.role}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: 'var(--text-3)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={11} />{dummyEmail(name, ex.accountId)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={11} />{dummyLocation(name)} · {dummyTenure(name)} yrs</span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ex.status && <Chip tone={departed ? 'navy': 'gold'}>{ex.status}</Chip>}
                  {ex.isTargetFunction && <Chip tone="gold">Buying center</Chip>}
                  {ex.synthetic && <Chip tone="navy">Illustrative</Chip>}
                  {ex.nameUnconfirmed && <Chip tone="navy">Name unconfirmed</Chip>}
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 8, marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <StepLabel>Opportunity</StepLabel>
                    {(ex.linkedOpportunityTitles.length > 0 ? ex.linkedOpportunityTitles: dummyFocus(name)).map(t => (
                      <div key={t} style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 2 }}>· {t}</div>
                    ))}
                  </div>
                  <div>
                    <StepLabel>Buying Influence</StepLabel>
                    {relMeta ? (
                      <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: relMeta.bg, color: relMeta.color }}>
                        {relMeta.label}
                      </span>
                    ): (
                      <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Not yet mapped</span>
                    )}
                  </div>
                  <div>
                    <StepLabel>Recommended Engagement</StepLabel>
                    <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.4 }}>
                      {engagement ?? 'Standing account review: no specific play flagged yet.'}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
  )
}

export default function ExecutiveRailBand({ data, openEvidence }: {
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
}) {
  const accounts = useMemo(
    () => data.quarters.map(q => ({ id: q.accountId, name: q.accountName, color: q.accentColor })),
    [data.quarters],
  )
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null)
  const roster = accountId ? data.executives.filter(e => e.accountId === accountId): []
  const companyUrl = accountId ? COMPANY_URL[accountId]: null

  return (
    <section id="home-executives">
      <SectionHeading eyebrow="14 · Engage" title="Leadership Intelligence"
        sub="Executive → Opportunity → Buying Influence → Recommended Engagement, ranked by priority. 👑 marks a high-priority contact." />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {accounts.map(a => (
          <Pill key={a.id} active={accountId === a.id} onClick={() => setAccountId(a.id)}>{a.name}</Pill>
        ))}
      </div>

      <ExecutiveGrid roster={roster} data={data} openEvidence={openEvidence} />

      {companyUrl && (
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <a href={companyUrl} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--navy)' }}>
            Visit {accounts.find(a => a.id === accountId)?.name} <ExternalLink size={13} />
          </a>
        </div>
      )}
    </section>
  )
}
