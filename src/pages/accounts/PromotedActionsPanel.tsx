import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, MessageSquarePlus, Trash2 } from 'lucide-react'
import { Card, EmptyState } from '../../components/shared/ui'
import {
  allInitiatives, setInitiativeProgress, addInitiativeUpdate, deleteInitiative,
  type Initiative,
} from '../../lib/initiatives'
import type { OrganizationIntelligence } from '../../lib/orgIntelligence'
import type { OpenEvidence } from '../home/homeTypes'

const STATUS_META: Record<Initiative['status'], { label: string; color: string; bg: string }> = {
  NotStarted: { label: 'Not started', color: 'var(--navy)', bg: 'var(--navy-faint)' },
  InProgress: { label: 'In progress', color: 'var(--gold-muted)', bg: 'var(--gold-light)' },
  Complete: { label: 'Complete', color: 'var(--emerald)', bg: 'var(--emerald-bg)' },
}

function fmt(ts: string): string {
  // Deterministic YYYY-MM-DD HH:MM from ISO; avoids locale surprises.
  return ts.slice(0, 16).replace('T', ' ')
}

function PromotedRow({ init, data, openEvidence, onChange }: {
  init: Initiative
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  onChange: () => void
}) {
  const [pct, setPct] = useState(init.progress_pct ?? 0)
  const [draft, setDraft] = useState('')
  const sMeta = STATUS_META[init.status]

  const commitProgress = (v: number) => {
    setPct(v)
    setInitiativeProgress(init, v)
    onChange()
  }
  const addUpdate = () => {
    const text = draft.trim()
    if (!text) return
    addInitiativeUpdate({ ...init, progress_pct: pct }, text, pct)
    setDraft('')
    onChange()
  }
  const evidence = init.source_id ? data.evidenceById[init.source_id] : null

  return (
    <Card style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.4 }}>{init.title}</div>
          {init.description && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.45 }}>Because {init.description}</div>}
        </div>
        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.03em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 999, background: sMeta.bg, color: sMeta.color }}>{sMeta.label}</span>
      </div>

      {/* Progress: editable % */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Progress</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>{pct}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--navy-faint)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--emerald)' : 'var(--navy)', borderRadius: 999, transition: 'width 150ms' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input type="range" min={0} max={100} step={5} value={pct}
            onChange={e => setPct(Number(e.target.value))}
            onMouseUp={e => commitProgress(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={e => commitProgress(Number((e.target as HTMLInputElement).value))}
            style={{ flex: '1 1 180px', accentColor: 'var(--navy)' }} />
          <span style={{ display: 'inline-flex', gap: 4 }}>
            {[25, 50, 75, 100].map(v => (
              <button key={v} onClick={() => commitProgress(v)}
                style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 7, cursor: 'pointer', border: '1px solid var(--border)', background: pct === v ? 'var(--navy)' : '#fff', color: pct === v ? '#fff' : 'var(--text-2)' }}>
                {v}%
              </button>
            ))}
          </span>
        </div>
      </div>

      {/* Updates log */}
      {(init.updates?.length ?? 0) > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {init.updates!.slice().reverse().map((u, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45 }}>
              <Clock size={12} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ color: 'var(--text-3)', fontWeight: 600, marginRight: 6 }}>{fmt(u.ts)}{u.progress_pct != null ? ` · ${u.progress_pct}%` : ''}</span>
                {u.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add update */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addUpdate() }}
          placeholder="Log an update…"
          style={{ flex: '1 1 200px', minWidth: 160, fontSize: 12.5, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', color: 'var(--text-1)' }} />
        <button onClick={addUpdate} disabled={!draft.trim()} className="btn"
          style={{ fontSize: 12, background: draft.trim() ? 'var(--navy)' : 'var(--navy-faint)', color: draft.trim() ? '#fff' : 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <MessageSquarePlus size={13} /> Log update
        </button>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
        {evidence && (
          <button className="btn btn-ghost" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            onClick={() => openEvidence(evidence.accountName ?? '', evidence.title, [evidence])}>
            <CheckCircle2 size={13} /> Evidence
          </button>
        )}
        <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--gold-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          onClick={() => { deleteInitiative(init.id); onChange() }}>
          <Trash2 size={13} /> Remove
        </button>
      </div>
    </Card>
  )
}

export function PromotedActionsPanel({ accountId, data, openEvidence, refreshKey, onChange }: {
  accountId: string | null
  data: OrganizationIntelligence
  openEvidence: OpenEvidence
  refreshKey: number
  onChange: () => void
}) {
  const items = useMemo(
    () => allInitiatives().filter(i => i.module === 'Organization' && i.source_type === 'HomeNextBestAction' && i.account_id === accountId),
    // refreshKey forces a re-read after a promote / progress edit / update.
    [accountId, refreshKey],
  )

  if (items.length === 0) {
    return <EmptyState title="No promoted actions yet"
      sub="Promote an action from the Actions list to start tracking its progress and log updates here." />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(init => (
        <PromotedRow key={init.id} init={init} data={data} openEvidence={openEvidence} onChange={onChange} />
      ))}
    </div>
  )
}
