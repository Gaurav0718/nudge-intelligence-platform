// ─── BULLET CONTENT PRIMITIVE ─────────────────────────────────────────────────
// Platform-wide rule: insight detail (drawers, popups, expanded cards) renders
// as short, scannable bullets — one idea per bullet — not long paragraphs.
// bulletize() splits on explicit line breaks, then sentences. Every bullet must
// be a COMPLETE, meaningful statement: a sentence is never cut mid-phrase. Only
// very long sentences (>25 words, roughly 2 lines) are split, and only at a
// comma/semicolon/colon boundary where both halves read as complete clauses. If
// no such boundary exists, the whole sentence stays one bullet.

import { type CSSProperties } from 'react'

function wordCount(s: string): number {
  return s.split(/\s+/).filter(Boolean).length
}

// First character of every bullet is a capital letter — applies to any leading
// quote/bracket too by uppercasing the first alphabetic character.
function capitalize(s: string): string {
  const idx = s.search(/[A-Za-z]/)
  if (idx < 0) return s
  return s.slice(0, idx) + s[idx].toUpperCase() + s.slice(idx + 1)
}

// Clause boundaries only — a cut here yields two complete, meaningful clauses.
// Comma/semicolon/colon boundaries normally separate subject-verb clauses, so a
// cut never produces a fragment. A comma boundary is rejected when the text
// after it starts a dependent structure (relative clause, subordinator, or
// participle such as "leaving…", "compounding…"), because the remainder would
// read as a dangling fragment on its own. Dash boundaries are deliberately
// avoided: dash clauses ("— losing X…", appositions) read as fragments too.
// The smallest acceptable fragment is 4 words, so a trailing short clause is
// left attached rather than creating a sliver bullet.
const MAX_BULLET_WORDS = 25
const MIN_FRAGMENT_WORDS = 4
const DEPENDENT_START = /^(which|who|whom|whose|that|because|although|though|while|since|unless|if|as|when|where|given|during|including|such|before|after|until|without|despite|with)\b/i

function isFragmentStart(remainder: string): boolean {
  const first = remainder.trim().replace(/^(and|but|or|so|nor|yet|then)\s+/i, '').split(/\s+/)[0] ?? ''
  if (!first) return false
  if (DEPENDENT_START.test(first)) return true
  if (/^[a-z][\w-]*ing\b/i.test(first)) return true
  return false
}

function findClauseBoundary(sentence: string, target: number): { index: number; length: number } | null {
  let best: { index: number; length: number } | null = null
  let bestDist = Infinity
  const re = /[,;:] /g
  let m: RegExpExecArray | null
  while ((m = re.exec(sentence)) !== null) {
    const before = sentence.slice(0, m.index)
    const after = sentence.slice(m.index + m[0].length)
    if (wordCount(before) < MIN_FRAGMENT_WORDS || wordCount(after) < MIN_FRAGMENT_WORDS) continue
    if (isFragmentStart(after)) continue
    const dist = Math.abs(wordCount(before) - target)
    if (dist < bestDist) { bestDist = dist; best = { index: m.index, length: m[0].length } }
  }
  return best
}

// Keeps every bullet complete: no splitting under the ceiling, and no split at
// all when no clause boundary exists — a whole long sentence beats a fragment.
function splitLong(sentence: string): string[] {
  const n = wordCount(sentence)
  if (n <= MAX_BULLET_WORDS) return [sentence]
  const cut = findClauseBoundary(sentence, Math.ceil(n / 2))
  if (!cut) return [sentence]
  const a = sentence.slice(0, cut.index).trim()
  const b = sentence.slice(cut.index + cut.length).trim()
  return [...splitLong(a), ...splitLong(b)]
}

export function bulletize(text: string): string[] {
  const src = text.trim()
  if (!src) return []
  const clean = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/^[-–•·—]\s*/, '').replace(/[.;]+$/, '')
  const parts: string[] = []
  for (const para of src.split(/\n+/).map(clean).filter(Boolean)) {
    const sents = para.split(/(?<=[.;])\s+(?=[A-Z0-9"'“])/g).map(clean).filter(Boolean)
    for (const s of sents) parts.push(...splitLong(s))
  }
  return parts.length > 0 ? parts : [clean(src)]
}

export function Bullets({ items, tone = 'navy', compact = false, clamp, style, className }: {
  items: string[] | string
  tone?: 'navy' | 'gold'
  compact?: boolean
  clamp?: number
  style?: CSSProperties
  className?: string
}) {
  const list = (Array.isArray(items) ? items.filter(Boolean) : bulletize(items)).map(capitalize)
  const dot = tone === 'gold' ? 'var(--gold)' : 'var(--navy)'
  return (
    <ul className={className} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: compact ? 4 : 7, ...style }}>
      {list.map((b, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: compact ? 12 : 13, lineHeight: 1.55, color: 'var(--text-1)' }}>
          <span aria-hidden style={{ flexShrink: 0, width: 6, height: 6, borderRadius: '50%', background: dot, marginTop: 7 }} />
          <span style={clamp ? { display: '-webkit-box', WebkitLineClamp: clamp, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}>{b}</span>
        </li>
      ))}
    </ul>
  )
}
