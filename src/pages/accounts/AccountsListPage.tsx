import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LayoutGrid, List as ListIcon, Sparkles, Bookmark, DollarSign, Target, Briefcase, User, Zap } from 'lucide-react'
import { ACCOUNTS_LIST, ACCOUNT_INFO } from '../../data/growthIndex'

const sentences = (s: string) => (s || '').split(/\.\s+/).map(x => x.trim().replace(/\.$/, '')).filter(Boolean)

// Command Center: keep only value-adding sentences. Strip "white space" territory
// wording, non-claims ("Zero Company penetration", "No confirmed Company
// relationship") and posture labels already shown as the pill on the card.
const stripLowValue = (s: string) => s
  .replace(/\b(true|pure|clean|zero|confirmed|current)\s+white[\s-]*space\b/gi, '')
  .replace(/\bwhite[\s-]*space\b/gi, '')
  .replace(/(?:zero|no)\s+(?:confirmed\s+)?Company\s+(?:penetration|relationship)\b/gi, '')
  .replace(/^\s*(?:Key Account|Strategic Priority Account|White Space Key Account)\s*[—–]\s*/i, '')
  .replace(/\s*[—–]\s*$/, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/[\s,]+\.?$/g, '')
  .replace(/\.$/, '')
  .trim()

const lowValueSentence = (s: string) =>
  !s ||
  /^(?:key account|strategic priority account|white space key account|zero company penetration|no confirmed company relationship)\.?$/i.test(s) ||
  /no confirmed company relationship/i.test(s) ||
  /zero company penetration/i.test(s)

const valuableSentences = (raw: string) => sentences(raw).map(stripLowValue).filter(s => !lowValueSentence(s))
const clean = (s: string) => stripLowValue(s || '')

function posture(a: any) {
  const label = (ACCOUNT_INFO[a.id]?.posture?.label) || (/priorit|strategic/i.test(a.strategicPosture || '') ? 'STRATEGIC PRIORITY' : 'FOCUSED GROWTH')
  // Uniform navy accent — no alternate colours between accounts/postures.
  return { label, priority: false, accent: 'var(--navy)' }
}

export default function AccountsListPage() {
  const nav = useNavigate()
  const [view, setView] = useState<'card' | 'list'>('card')

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>Account Intelligence</div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.01em' }}>Company Command Center</h1>
          <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6 }}>Strategic account intelligence — {ACCOUNTS_LIST.length} accounts mapped</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: 3 }}>
            <SegBtn active={view === 'card'} onClick={() => setView('card')} icon={<LayoutGrid size={14} />}>Card View</SegBtn>
            <SegBtn active={view === 'list'} onClick={() => setView('list')} icon={<ListIcon size={14} />}>List View</SegBtn>
          </div>
          <button className="btn btn-navy" onClick={() => nav('/accounts')} style={{ padding: '10px 18px' }}>
            <Sparkles size={15} /> Discover &amp; Analyze
          </button>
        </div>
      </div>

      {view === 'card' ? (
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 22, alignItems: 'stretch' }}>
          {ACCOUNTS_LIST.map(a => <AccountCard key={a.id} a={a} onOpen={() => nav(`/accounts/${a.id}`)} />)}
        </div>
      ) : (
        <AccountTable onOpen={id => nav(`/accounts/${id}`)} />
      )}
    </div>
  )
}

function SegBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
        background: active ? 'var(--navy)' : 'transparent', color: active ? '#fff' : 'var(--text-3)' }}>
      {icon}{children}
    </button>
  )
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 5 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: accent || 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  )
}

function AccountCard({ a, onOpen }: { a: any; onOpen: () => void }) {
  const p = posture(a)
  const rev = a.revenues || {}
  const [saved, setSaved] = useState(false)
  const chips: string[] = (ACCOUNT_INFO[a.id]?.strategicPriorities || []).slice(0, 3).map((x: any) => clean(x.title)).filter(Boolean)
  const risk = valuableSentences(a.pressureVectors)[0]
  const riskShort = risk ? (risk.length > 46 ? risk.slice(0, 44) + '…' : risk) : ''
  const clip = (s: string, n = 34) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Top accent bar */}
      <div style={{ height: 4, background: p.accent, flexShrink: 0 }} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: p.priority ? 'var(--gold-light)' : 'var(--navy-faint)', color: p.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{a.logo}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{a.executivesMapped} executives mapped</div>
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 6,
              background: p.priority ? 'var(--gold-light)' : 'var(--navy-faint)', color: p.priority ? '#b89428' : 'var(--navy)' }}>{p.label}</span>
          </div>
          <button title={saved ? 'Saved' : 'Save'} onClick={e => { e.stopPropagation(); setSaved(s => !s) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: saved ? 'var(--navy)' : 'var(--text-3)', flexShrink: 0 }}>
            <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* 2×2 stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Stat icon={<DollarSign size={12} />} label="Current Revenue" value={rev.current ?? 'N/A'} />
          <Stat icon={<Target size={12} />} label="3-Year Target" value={rev.target3yr ?? 'N/A'} accent="var(--navy)" />
          <Stat icon={<Briefcase size={12} />} label="Portfolio Head" value={a.portfolioHead ?? 'N/A'} />
          <Stat icon={<User size={12} />} label="Account Owner" value={a.accountOwner ?? 'N/A'} />
        </div>

        {/* Description — clamped to 2 lines */}
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{valuableSentences(a.strategicPosture).join('. ')}</p>

        {/* Tag chips */}
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {chips.map((c, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: p.priority ? '#b89428' : 'var(--navy)', background: p.priority ? 'var(--gold-light)' : 'var(--navy-faint)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', whiteSpace: 'nowrap' }}>{clip(c)}</span>
            ))}
          </div>
        )}

        {/* Footer: risk + View Dossier */}
        <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)', minWidth: 0 }}>
            {riskShort && <><Zap size={13} style={{ color: 'var(--navy)', flexShrink: 0 }} /><span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{riskShort}</span></>}
          </span>
          <button className="btn btn-navy" onClick={e => { e.stopPropagation(); onOpen() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            View Dossier <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function AccountTable({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {ACCOUNTS_LIST.map(a => <AccountRow key={a.id} a={a} onOpen={() => onOpen(a.id)} />)}
    </div>
  )
}

function AccountRow({ a, onOpen }: { a: any; onOpen: () => void }) {
  const p = posture(a)
  const [saved, setSaved] = useState(false)
  const bullets = (raw: string) => {
    const items = valuableSentences(raw)
    if (items.length === 0) return 'N/A'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0, marginTop: 7 }} />
            <span>{s}.</span>
          </div>
        ))}
      </div>
    )
  }
  const cols: { label: string; value: React.ReactNode }[] = [
    { label: 'Strategic Posture', value: bullets(a.strategicPosture) },
    { label: 'Investment Direction', value: bullets(a.investmentDirection) },
    { label: 'Pressure Vectors', value: bullets(a.pressureVectors) },
    { label: 'Executives Mapped', value: <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>{a.executivesMapped ?? 'N/A'}</span> },
  ]
  const btn: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', padding: '8px 16px' }
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 4, background: p.accent }} />
      <div style={{ padding: '20px 26px' }}>
        {/* Header: name + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>{a.name}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-navy" style={btn} onClick={e => { e.stopPropagation(); setSaved(s => !s) }}>
              {saved ? 'BOOKMARKED' : 'BOOKMARK'}
            </button>
            <button className="btn btn-navy" style={btn} onClick={onOpen}>VIEW FULL DOSSIER</button>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '16px 0 18px' }} />
        {/* 4-column detail grid */}
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 24 }}>
          {cols.map((c, i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
