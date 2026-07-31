// ─── Unified executive roster (consolidated account view) ─────────────────────
// One roster per account, merged from every source so Key Executives (top 3) and
// Leadership Intelligence show the SAME people, tagged, with unique photos:
//   1. accounts.seed ALL_EXECS  — rich detail + relationship (Champion/Warm/Cold/WhiteSpace)
//   2. accounts.seed org chart   — extra named leaders + relationship
//   3. research data.executives  — real names, target functions, synthetic pads
// Deduped by name, ranked so the meaningful (tagged) people sit on top.

import { ALL_EXECS, DOSSIERS, type AccountExec } from '../data/accounts.seed'
import { RELATIONSHIP_META } from './connectedIntelligence'
import type { OrganizationIntelligence, EvidenceItem, ExecCard } from './orgIntelligence'

export type Relationship = AccountExec['relationship']

export interface RosterExec {
  key: string
  name: string
  title: string
  relationship: Relationship        // untagged people default to 'WhiteSpace' (= not yet mapped)
  rich: AccountExec | null
  research: ExecCard | null
}

const REL_ORDER: Record<Relationship, number> = { Champion: 4, Warm: 3, Cold: 2, WhiteSpace: 1 }
const PRIO: Record<string, number> = { High: 3, Medium: 2, Low: 1 }
const norm = (s: string) => s.trim().toLowerCase()

export function buildAccountRoster(data: OrganizationIntelligence, accountId: string): RosterExec[] {
  const byName = new Map<string, RosterExec>()
  const get = (name: string): RosterExec => {
    const k = norm(name)
    let cur = byName.get(k)
    if (!cur) { cur = { key: k, name, title: '', relationship: 'WhiteSpace', rich: null, research: null }; byName.set(k, cur) }
    return cur
  }

  // 1 — rich execs (authoritative title + relationship + detail)
  for (const e of ALL_EXECS.filter(e => e.account_id === accountId)) {
    const r = get(e.name); r.title = e.title; r.relationship = e.relationship; r.rich = e
  }
  // 2 — org-chart leaders (fill relationship / title if not already richer)
  const dossier = DOSSIERS.find(d => d.account_id === accountId)
  for (const p of dossier?.org ?? []) {
    const r = get(p.name)
    if (!r.title) r.title = p.title
    if (!r.rich) r.relationship = p.relationship
  }
  // 3 — research execs, target functions, synthetic pads (extra bodies to reach 7–8)
  for (const ex of data.executives.filter(e => e.accountId === accountId)) {
    const name = ex.name ?? ex.role
    const r = get(name); r.research = ex
    if (!r.title) r.title = ex.role
  }

  const score = (r: RosterExec) => REL_ORDER[r.relationship] * 10 + (r.research ? PRIO[r.research.priority] ?? 0 : 0) + (r.rich ? 5 : 0)
  // Drop role-as-name placeholders (e.g. "VP, Vaccines Commercial" whose title is
  // the same words) — they render as a name/designation duplicate.
  const isPlaceholder = (r: RosterExec) =>
    norm(r.name) === norm((r.title || '').replace(/,/g, '')) ||
    /\b(VP|SVP|EVP|Owner|Mandate|Function|Lead|Head of)\b/i.test(r.name)
  return [...byName.values()].filter(r => !isPlaceholder(r)).sort((a, b) => score(b) - score(a))
}

/** Rich evidence for the drawer ("POP insight"): prefers ALL_EXECS detail, then
 *  the research evidence item, else a light relationship card. */
export function rosterExecToEvidence(rex: RosterExec, accountName: string, data: OrganizationIntelligence): EvidenceItem {
  const relLabel = RELATIONSHIP_META[rex.relationship].label
  const isGap = rex.relationship === 'Cold' || rex.relationship === 'WhiteSpace'
  if (rex.rich) {
    const ex = rex.rich
    return {
      id: `exec:${ex.id}`, kind: 'executive', accountId: ex.account_id, accountName, accentColor: null,
      title: ex.name, categoryLabel: 'Leadership',
      what_happened: `${ex.title}. ${ex.company_role}`,
      so_what: ex.indegene_selling_point,
      why_it_matters: ex.why_it_matters ?? `${ex.name} owns the function the engagement would serve — the relationship status (${relLabel.toLowerCase()}) determines how fast Company can convert it.`,
      priority: isGap ? 'High' : 'Medium',
      connectedModules: [
        { module: 'Relationship', signal: `${ex.name} — ${relLabel} relationship; ${ex.title} at ${accountName}.` },
      ],
      if_no_action: isGap
        ? `${ex.name} sets ${accountName}'s agenda with whoever engages first; a ${relLabel.toLowerCase()} relationship leaves the account exposed if a competitor reaches them.`
        : `A warm relationship with ${ex.name} decays without a live proposition, ceding ground the next buying cycle.`,
      nbas: [{
        action: ex.sales_do[0],
        actor: 'Company executive sponsor / account lead',
        target: `${ex.name} (${ex.title}), ${accountName}`,
        whyNow: isGap ? 'Relationship is not yet established — first credible proposition frames the buying cycle.' : 'A warm relationship is the moment to convert into an active pursuit.',
        outcome: ex.nba_outcome ?? `A first working engagement with ${ex.name} (${ex.title}) — measured as a signed pilot with a named next step.`,
      }],
      expected_outcome: `Relationship with ${ex.name} advanced from ${relLabel} toward an active, sponsored engagement.`,
      who: { name: ex.name, role: ex.title },
      factBlock: [{ label: 'Relationship', value: relLabel }, ...ex.key_traits.map(t => ({ label: t.name, value: t.summary }))],
      positives: ex.sales_do, negatives: ex.sales_dont,
      sources: [], dateISO: null,
    }
  }
  const evi = rex.research ? data.evidenceById[rex.research.evidenceId] : null
  if (evi) {
    return {
      ...evi, categoryLabel: 'Leadership',
      priority: evi.priority ?? (isGap ? 'High' : 'Medium'),
      connectedModules: evi.connectedModules ?? [
        { module: 'Relationship', signal: `${rex.name} — ${relLabel} relationship; ${rex.title} at ${accountName}.` },
      ],
      if_no_action: evi.if_no_action ?? `${rex.name}'s agenda is set by whoever engages first; the ${relLabel.toLowerCase()} relationship is an opening a competitor can take.`,
      nbas: evi.nbas ?? [{
        action: evi.next_best_action ?? `Open a first executive conversation with ${rex.name} anchored on ${accountName}'s stated priorities.`,
        actor: 'Company executive sponsor / account lead',
        target: `${rex.name} (${rex.title}), ${accountName}`,
        whyNow: 'The relationship is unmapped — first mover sets the frame.',
        outcome: `A mapped, sponsored relationship with ${rex.name}.`,
      }],
      factBlock: [{ label: 'Relationship', value: relLabel }, ...(evi.factBlock ?? [])],
    }
  }
  return {
    id: `exec:${rex.key}`, kind: 'executive', accountId: null, accountName, accentColor: null,
    title: rex.name, categoryLabel: 'Leadership',
    what_happened: `${rex.title}.`,
    so_what: `Relationship status: ${relLabel}. Mapping this contact opens a fresh engagement path for the account.`,
    priority: isGap ? 'High' : 'Medium',
    connectedModules: [
      { module: 'Relationship', signal: `${rex.name} — ${relLabel}; ${rex.title} at ${accountName}.` },
      { module: 'Sales & Growth', signal: `No engagement mapped to ${rex.name} yet — an open relationship path.` },
    ],
    if_no_action: `${rex.name} remains unmapped while a competitor establishes the first relationship at ${accountName}.`,
    nbas: [{
      action: `Open a first executive conversation with ${rex.name} anchored on ${accountName}'s stated priorities and a relevant Company reference.`,
      actor: 'Company executive sponsor / account lead',
      target: `${rex.name} (${rex.title}), ${accountName}`,
      whyNow: 'The relationship is not yet established — first credible contact frames the account.',
      outcome: `A mapped, sponsored relationship with ${rex.name} at ${accountName}.`,
    }],
    who: { name: rex.name, role: rex.title },
    factBlock: [{ label: 'Relationship', value: relLabel }],
    sources: [], dateISO: null,
  }
}
