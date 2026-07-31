import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowUpRight } from 'lucide-react'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import { SectionHeading, Card, Badge, EmptyState } from '../../components/shared/ui'
import {
  initiativesForModule, checklistFor, addChecklistItem, toggleChecklistItem, removeChecklistItem,
  upsertInitiative, deleteInitiative, createInitiative, type Initiative, type InitiativeStatus,
} from '../../lib/initiatives'
import { serviceLineLabel } from '../../data/shared'
import { MARKETING_TABS } from './marketingTabs'

const STATUS_META: Record<InitiativeStatus, { badge: any; label: string }> = {
  NotStarted: { badge: 'navy', label: 'Not started' },
  InProgress: { badge: 'amber', label: 'In progress' },
  Complete: { badge: 'emerald', label: 'Complete' },
}

export default function ExecutionWorkspacePage() {
  const nav = useNavigate()
  const [, force] = useState(0)
  const refresh = () => force(x => x + 1)
  const initiatives = initiativesForModule('MarketingServiceLine')

  const cycleStatus = (i: Initiative) => {
    const order: InitiativeStatus[] = ['NotStarted', 'InProgress', 'Complete']
    const next = order[(order.indexOf(i.status) + 1) % order.length]
    upsertInitiative({ ...i, status: next }); refresh()
  }

  const addInitiative = () => {
    createInitiative({
      title: 'New initiative', status: 'NotStarted', module: 'MarketingServiceLine',
      source_type: 'Manual', description: '', account_id: null, service_line: null,
    })
    refresh()
  }

  return (
    <div>
      <SectionHeading eyebrow="Marketing & Service Line" title="Execution Workspace"
        sub="Tracked initiatives promoted from Next Best Action (shared initiatives table, module = MarketingServiceLine). Break each into a checklist and drive it to done."
        right={<button className="btn btn-navy" onClick={addInitiative}><Plus size={14} /> Add Initiative</button>} />
      <ModuleTabBar tabs={MARKETING_TABS} />

      {initiatives.length === 0 ? (
        <Card style={{ padding: 0 }}>
          <EmptyState title="No initiatives yet"
            sub="Add one directly, or promote a recommendation from Next Best Action." />
          <div style={{ textAlign: 'center', paddingBottom: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-navy" onClick={addInitiative}><Plus size={14} /> Add Initiative</button>
            <button className="btn btn-ghost" onClick={() => nav('/marketing/next-best-action')}><ArrowUpRight size={14} /> Go to Next Best Action</button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {initiatives.map(i => <InitiativeCard key={i.id} initiative={i} onChange={refresh} onCycle={() => cycleStatus(i)} onDelete={() => { deleteInitiative(i.id); refresh() }} />)}
        </div>
      )}
    </div>
  )
}

function InitiativeCard({ initiative, onChange, onCycle, onDelete }: {
  initiative: Initiative; onChange: () => void; onCycle: () => void; onDelete: () => void
}) {
  const [text, setText] = useState('')
  const items = checklistFor(initiative.id)
  const done = items.filter(i => i.is_complete).length
  const m = STATUS_META[initiative.status]

  const add = () => { if (text.trim()) { addChecklistItem(initiative.id, text.trim()); setText(''); onChange() } }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
            <button onClick={onCycle} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Badge color={m.badge}>{m.label}</Badge></button>
            {initiative.service_line && <Badge color="gold">{serviceLineLabel(initiative.service_line)}</Badge>}
          </div>
          <input value={initiative.title}
            onChange={e => { upsertInitiative({ ...initiative, title: e.target.value }); onChange() }}
            style={{ width: '100%', fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, border: 'none', borderBottom: '1px solid transparent', background: 'transparent', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderBottomColor = 'var(--border-strong)'}
            onBlur={e => e.target.style.borderBottomColor = 'transparent'} />
          {initiative.description && <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{initiative.description}</p>}
        </div>
        <button className="btn btn-ghost" onClick={onDelete} style={{ padding: '7px 10px' }}><Trash2 size={14} /></button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-raised)', overflow: 'hidden' }}>
          <div style={{ width: `${items.length ? (done / items.length) * 100 : 0}%`, height: '100%', background: 'var(--emerald)', transition: 'width 200ms' }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{done}/{items.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={item.is_complete} onChange={() => { toggleChecklistItem(item); onChange() }}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--navy)' }} />
            <span style={{ flex: 1, fontSize: 13, color: item.is_complete ? 'var(--text-3)' : 'var(--text-1)', textDecoration: item.is_complete ? 'line-through' : 'none' }}>{item.text}</span>
            <button onClick={() => { removeChecklistItem(item.id); onChange() }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Add a checklist item…"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 13, background: 'var(--bg-surface)', color: 'var(--text-1)' }} />
        <button className="btn btn-navy" onClick={add}><Plus size={14} /> Add</button>
      </div>
    </Card>
  )
}
