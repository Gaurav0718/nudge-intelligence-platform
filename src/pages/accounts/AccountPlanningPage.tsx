import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Download, Save, Plus, X, Check, Trash2, ChevronDown, ArrowRight, Search, Upload, Maximize2, Pencil } from 'lucide-react'
import { ACCOUNTS_LIST, ACCOUNT_PLAN, ACCOUNT_INFO, BROWSE_BY_OPTIONS } from '../../data/growthIndex'
import { getAllPlanSections, savePlanSection, getLatestPublishedSection, getLatestDraftSection, type PlanSection } from '../../lib/growthStore'
import {
  businessHealthFor, competitionUpdateFor, deliveryUpdatesFor, immediateStepsFor, PRIORITY_META,
  type BusinessHealth, type CompGroup, type DeliveryUpdateRow, type NextStep, type Priority, type BookRow,
} from '../../data/growthPlanExtra'
import { engagementsForAccount, ragOf } from '../../data/delivery.seed'
import Avatar from '../../components/shared/Avatar'

// ── Version Toolbar ───────────────────────────────────────────────────────────
function VersionToolbar({ versions, selectedVersion, onSelect, hasDraft, onSave, onPublish }: {
  versions: PlanSection[]; selectedVersion: string; onSelect:(id:string)=>void; hasDraft:boolean; onSave:()=>void; onPublish:()=>void
}) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
      <span style={{ fontSize:13.5, color:'var(--text-3)', fontWeight:600 }}>Version</span>
      <select className="select" value={selectedVersion} onChange={e=>onSelect(e.target.value)} style={{ fontSize:13.5, minWidth:190 }}>
        <option value="live">Current (live edit)</option>
        {versions.map(v => (
          <option key={v.id} value={v.id!}>
            v{v.version_number}{v.is_draft?' (Draft)':''} · {v.saved_at ? new Date(v.saved_at).toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'2-digit'}) : ''}
          </option>
        ))}
      </select>
      <button onClick={onSave} className="btn btn-ghost btn-sm" style={{ display:'flex', gap:5 }}>
        <Save size={13}/> Save Draft
      </button>
      <button onClick={onPublish} className="btn btn-brand btn-sm">PUBLISH</button>
      {hasDraft && <span className="badge badge-amber" style={{ fontSize:12.5 }}>DRAFT</span>}
    </div>
  )
}

// ── Account Review Recap — HORIZONTAL category labels ────────────────────────
const RECAP_GROUPS = ['Significant GTM Development','Significant Deal / RFP / RFI Updates','Miscellaneous Updates','Significant Delivery Updates']
const BUS = ['ECS','EMS','OTHERS']

function AccountReviewRecapView({ planData, publishedData, onChange }: { planData:any; publishedData?:any; onChange:(d:any)=>void }) {
  // publishedData may be {rows:[...]} from DB  OR  the nested {[group]:{[bu]:{...}}} from an old save
  // Normalise to internal nested format for editing, but always emit {rows:[...]} for the PPT
  const toNested = (src: any) => {
    if (!src) return null
    // Already in {rows:[...]} shape
    if (Array.isArray(src.rows)) {
      const init: any = {}
      RECAP_GROUPS.forEach(g => {
        init[g] = {}
        BUS.forEach(b => {
          const row = src.rows.find((r:any)=>r.category===g&&r.bu===b)||{}
          init[g][b] = { left:row.whereWeLeftOff||'', update:row.updateOnProgress||'', next:row.nextSteps||'' }
        })
      })
      return init
    }
    // Already in nested {[group]:{[bu]:{left,update,next}}} shape
    if (typeof src === 'object' && RECAP_GROUPS.some(g => src[g])) return src
    return null
  }

  const toRows = (nested: any) => ({
    rows: RECAP_GROUPS.flatMap(g =>
      BUS.map(b => ({
        category: g, bu: b,
        whereWeLeftOff:    nested[g]?.[b]?.left   || '',
        updateOnProgress:  nested[g]?.[b]?.update || '',
        nextSteps:         nested[g]?.[b]?.next   || '',
      }))
    )
  })

  const seedNested = toNested(publishedData) || toNested({ rows: planData?.accountReviewRecap?.rows }) || (() => {
    const init: any = {}
    RECAP_GROUPS.forEach(g => { init[g] = {}; BUS.forEach(b => { init[g][b] = { left:'', update:'', next:'' } }) })
    return init
  })()

  const [data, setData] = useState<Record<string,Record<string,any>>>(seedNested)

  // Fire onChange on mount so sectionData is always populated
  useEffect(() => { onChange(toRows(data)) }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const update = (g:string, b:string, f:'left'|'update'|'next', val:string) => {
    const n = { ...data, [g]:{ ...data[g],[b]:{ ...data[g][b],[f]:val } } }
    setData(n)
    onChange(toRows(n))  // always emit rows[] format
  }

  return (
    <div>
      <div className="section-heading glow" style={{ fontSize:16, marginBottom:18 }}>What changed since last account review — Recap</div>
      <div style={{ overflowX:'auto' }}>
        <table className="recap-table" style={{ minWidth:900 }}>
          <thead>
            <tr>
              <th style={{ width:150, textAlign:'center' }}></th>
              <th style={{ width:96, textAlign:'center' }}>BU</th>
              <th>WHERE WE LEFT OFF</th>
              <th>UPDATE ON PROGRESS</th>
              <th>NEXT STEPS</th>
            </tr>
          </thead>
          <tbody>
            {RECAP_GROUPS.map(group => (
              BUS.map((bu, bi) => (
                <tr key={`${group}-${bu}`}>
                  {bi === 0 && (
                    <td rowSpan={BUS.length} style={{
                      verticalAlign:'middle', textAlign:'center',
                      padding:'10px 8px', border:'1px solid var(--border)',
                      background:'linear-gradient(180deg, var(--bg-raised), var(--bg-subtle))',
                      fontSize:13.5, fontWeight:800, color:'var(--text-1)',
                      lineHeight:1.4, fontFamily:'Nunito,sans-serif',
                    }}>
                      {group}
                    </td>
                  )}
                  <td className="bu-cell" style={{ textAlign:'center', padding:'6px 4px' }}>
                    <span style={{
                      display:'inline-block', boxSizing:'border-box', maxWidth:'100%',
                      padding:'3px 9px', borderRadius:5, whiteSpace:'nowrap',
                      background:'var(--navy-faint)', color:'var(--navy)',
                      fontWeight:800, fontSize:12, letterSpacing:'0.03em',
                    }}>{bu}</span>
                  </td>
                  {(['left','update','next'] as const).map(field => (
                    <td key={field} className="content-cell">
                      <textarea className="textarea-cell"
                        placeholder="Enter details..."
                        value={data[group]?.[bu]?.[field]||''}
                        onChange={e=>update(group,bu,field,e.target.value)}
                        style={{ resize:'vertical', minHeight:90, fontSize:14, width:'100%', boxSizing:'border-box' }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize:13.5, color:'var(--text-3)', marginTop:14, fontStyle:'italic' }}>Changes will be saved when you click Save Draft or Publish.</p>
    </div>
  )
}

// ── SWOT Inferences ───────────────────────────────────────────────────────────
function InferencesView({ accountId, planData, publishedData, onChange }: { accountId:string; planData:any; publishedData?:any; onChange:(d:any)=>void }) {
  const seed = publishedData || planData
  const [swot, setSwot] = useState<Record<string,string>>(() => {
    const s = seed?.swot || planData?.swot || ACCOUNT_INFO[accountId]?.swot
    if (s) return {
      S: Array.isArray(s.S) ? s.S.join('\n\n') : (s.S||''),
      W: Array.isArray(s.W) ? s.W.join('\n\n') : (s.W||''),
      O: Array.isArray(s.O) ? s.O.join('\n\n') : (s.O||''),
      T: Array.isArray(s.T) ? s.T.join('\n\n') : (s.T||''),
    }
    return { S:'', W:'', O:'', T:'' }
  })
  useEffect(() => { onChange(swot) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const update = (k:string, val:string) => { const n={...swot,[k]:val}; setSwot(n); onChange(n) }
  const cells = [
    { key:'S', label:'Strength',    color:'var(--navy)', bg:'var(--navy-faint)', icon:'' },
    { key:'W', label:'Weakness',    color:'var(--navy)',     bg:'var(--navy-faint)',     icon:'' },
    { key:'O', label:'Opportunity', color:'var(--navy)',    bg:'var(--navy-faint)',    icon:'' },
    { key:'T', label:'Threat',      color:'var(--navy)',   bg:'var(--navy-faint)',   icon:'' },
  ]
  return (
    <div>
      <div className="section-heading glow" style={{ fontSize:16, marginBottom:18 }}>SWOT Analysis — Inferences</div>
      <div className="swot-grid">
        {cells.map(cell => (
          <div key={cell.key} style={{
            background:`linear-gradient(135deg, ${cell.bg}, var(--bg-surface))`,
            border:`1.5px solid ${cell.color}44`, borderRadius:'var(--radius-md)', padding:18,
            boxShadow:`0 0 16px ${cell.color}18`,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:cell.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13.5, fontWeight:900, fontFamily:'Sora,sans-serif', boxShadow:`0 0 12px ${cell.color}55` }}>
                {cell.key}
              </div>
              <div>
                <div className="section-heading" style={{ fontSize:14.5 }}>{cell.label}</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:13.5 }}>{cell.icon}</span>
            </div>
            <textarea
              value={swot[cell.key]||''}
              onChange={e=>update(cell.key,e.target.value)}
              style={{ width:'100%', minHeight:140, padding:'10px 12px', background:'rgba(0,0,0,0.15)', border:`1px solid ${cell.color}33`, borderRadius:8, resize:'both', fontSize:14.5, fontFamily:'Nunito,sans-serif', fontWeight:500, color:'var(--text-1)', outline:'none', lineHeight:1.7 }}
              placeholder={`${cell.label} points, one per line...`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Big Bets — ALL BUs in ONE page, Approved=static, Nudge=editable ───────────
const ALL_BUS = ['ECS','EMS','Clinical','Others']

function OurBigBetsView({ planData, publishedData, onChange }: { planData:any; publishedData?:any; onChange:(d:any)=>void }) {
  const seed = publishedData || planData
  const [tab, setTab] = useState<'approved'|'nudge'>('approved')
  const [nudgeItems, setNudgeItems] = useState<any[]>(() =>
    (seed?.nudgeBigBets || planData?.nudgeBigBets||[]).flatMap((bu:any, bui:number) =>
      (bu.rows||[]).map((r:any, ri:number) => ({
        id:`nudge_${bui}_${ri}`, bu:bu.bu, focus:r.focus, acv:r.acv,
        details:[...(r.details||[])], stakeholder:r.stakeholder, nextSteps:r.nextSteps,
        updates:'', status:'pending' as 'pending'|'approved'|'rejected',
      }))
    )
  )
  const [approvedEdits, setApprovedEdits] = useState<Record<string,string>>({})

  // All approved big bets combined from all BUs
  const allApproved = (seed?.bigBets || planData?.bigBets||[]).flatMap((bu:any) =>
    (bu.rows||[]).map((r:any, i:number) => ({ ...r, bu:bu.bu, _id:`${bu.bu}_${i}` }))
  )
  const approvedFromNudge = nudgeItems.filter(n=>n.status==='approved')
  const combined = [...allApproved, ...approvedFromNudge]

  useEffect(() => { onChange({ bigBets: seed?.bigBets || planData?.bigBets, nudgeBigBets: seed?.nudgeBigBets || planData?.nudgeBigBets }) }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const approveBet = (id:string) => setNudgeItems(prev=>prev.map(n=>n.id===id?{...n,status:'approved'}:n))
  const rejectBet  = (id:string) => setNudgeItems(prev=>prev.map(n=>n.id===id?{...n,status:'rejected'}:n))
  const deleteBet  = (id:string) => setNudgeItems(prev=>prev.filter(n=>n.id!==id))
  const updateNudge = (id:string, field:string, val:any) =>
    setNudgeItems(prev=>{ const n=prev.map(x=>x.id===id?{...x,[field]:val}:x); onChange(n); return n })

  // Shared table renderer — Approved and Company Recommended use the SAME layout.
  const HEAD = ['#','FOCUS AREA','ACV ($M)','DETAILS','STAKEHOLDER','NEXT STEPS','UPDATES','ACTIONS']
  const TH: React.CSSProperties = { padding:'9px 12px', textAlign:'left', fontSize:12.5, fontWeight:800, color:'var(--text-2)', letterSpacing:'0.06em', borderBottom:'2px solid var(--border)', whiteSpace:'nowrap' }
  const TD: React.CSSProperties = { padding:'10px 12px', verticalAlign:'top', fontSize:14, color:'var(--text-2)' }
  const buPill = (bu:string) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
      <span style={{ padding:'4px 14px', borderRadius:20, background:'var(--navy-faint)', color:'var(--navy)', fontSize:13, fontWeight:800, letterSpacing:'0.06em' }}>{bu}</span>
      <div style={{ flex:1, height:1, background:'var(--border)' }}/>
    </div>
  )
  const detailsCell = (details:string[], edit?:(i:number,v:string)=>void) => (
    <ul style={{ margin:0, padding:'0 0 0 14px', display:'flex', flexDirection:'column', gap:5 }}>
      {(details||[]).map((d,di)=>(
        <li key={di} style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>
          {edit
            ? <textarea value={d} onChange={e=>edit(di,e.target.value)} style={{ width:'100%', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 8px', fontSize:14, fontFamily:'inherit', color:'var(--text-1)', resize:'vertical', outline:'none', minHeight:34, boxSizing:'border-box' }}/>
            : d}
        </li>
      ))}
    </ul>
  )
  const updatesCell = (val:string, set:(v:string)=>void) => (
    <textarea value={val} onChange={e=>set(e.target.value)} className="textarea-cell" placeholder="Add updates..."
      style={{ minHeight:70, resize:'vertical', fontSize:13.5, width:'100%', minWidth:150, boxSizing:'border-box' }}/>
  )
  const StatusBadge = ({label}:{label:string}) => (
    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, background:'var(--navy-faint)', color:'var(--navy)', fontSize:12, fontWeight:800, letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{label}</span>
  )

  const renderTable = (bu:string, mode:'approved'|'nudge', rows:any[]) => (
    <div key={`${mode}-${bu}`} style={{ marginBottom:24 }}>
      {buPill(bu)}
      <div style={{ overflowX:'auto', border:'1px solid var(--border)', borderRadius:10 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, minWidth:960 }}>
          <thead><tr style={{ background:'var(--bg-raised)' }}>{HEAD.map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, ri) => {
              const keyId = mode==='nudge' ? row.id : (row._id||String(ri))
              return (
                <tr key={keyId} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ ...TD, color:'var(--navy)', fontWeight:800 }}>{ri+1}</td>
                  <td style={{ ...TD, minWidth:170 }}>
                    {mode==='nudge'
                      ? <textarea value={row.focus} onChange={e=>updateNudge(row.id,'focus',e.target.value)} rows={2} style={{ width:'100%', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:6, padding:'6px 8px', fontSize:14, fontWeight:700, fontFamily:'inherit', color:'var(--text-1)', resize:'vertical', outline:'none', boxSizing:'border-box' }}/>
                      : <span style={{ fontWeight:700, color:'var(--text-1)' }}>{row.focus}</span>}
                  </td>
                  <td style={TD}><span style={{ fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:15, color:'var(--navy)' }}>{row.acv}</span></td>
                  <td style={{ ...TD, minWidth:240 }}>
                    {detailsCell(row.details, mode==='nudge' ? (i,v)=>updateNudge(row.id,'details',row.details.map((x:string,xi:number)=>xi===i?v:x)) : undefined)}
                  </td>
                  <td style={{ ...TD, minWidth:130 }}>{row.stakeholder}</td>
                  <td style={{ ...TD, minWidth:130 }}>{row.nextSteps}</td>
                  <td style={{ ...TD, padding:'6px', minWidth:160 }}>
                    {mode==='nudge'
                      ? updatesCell(row.updates||'', v=>updateNudge(row.id,'updates',v))
                      : updatesCell(approvedEdits[keyId]||'', v=>setApprovedEdits(prev=>({...prev,[keyId]:v})))}
                  </td>
                  <td style={{ ...TD, minWidth:150 }}>
                    {mode==='approved' && <StatusBadge label="Approved"/>}
                    {mode==='nudge' && row.status==='approved' && <StatusBadge label="Approved"/>}
                    {mode==='nudge' && row.status==='pending' && (
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        <button onClick={()=>approveBet(row.id)} className="btn btn-success btn-xs" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}><Check size={11}/> Approve</button>
                        <button onClick={()=>rejectBet(row.id)} className="btn btn-ghost btn-xs" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}><X size={11}/> Reject</button>
                        <button onClick={()=>deleteBet(row.id)} className="btn btn-danger btn-xs" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:4 }}><Trash2 size={11}/> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div>
      {/* Tab */}
      <div style={{ display:'flex', borderBottom:'2px solid var(--border)', marginBottom:20 }}>
        {(['approved','nudge'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'10px 20px', background:'none', border:'none', cursor:'pointer', fontFamily:'Nunito,sans-serif',
            fontSize:14.5, fontWeight:tab===t?800:600, color:tab===t?'var(--brand-2)':'var(--text-3)',
            borderBottom:tab===t?'2px solid var(--brand-2)':'2px solid transparent', marginBottom:-2,
            transition:'all 180ms',
          }}>
            {t==='approved'?'Approved Big Bets':'Company Recommended'}
            {t==='nudge' && nudgeItems.filter(n=>n.status==='pending').length>0 && (
              <span className="badge badge-brand" style={{ fontSize:12.5, marginLeft:6 }}>{nudgeItems.filter(n=>n.status==='pending').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* APPROVED */}
      {tab==='approved' && (
        <div>
          {combined.length===0 && (
            <div style={{ padding:'40px', textAlign:'center', color:'var(--text-3)', fontSize:14.5 }}>
              No approved big bets yet. Approve from Company Recommended.
            </div>
          )}
          {ALL_BUS.map(bu => {
            const rows = combined.filter(r=>r.bu===bu)
            return rows.length===0 ? null : renderTable(bu, 'approved', rows)
          })}
        </div>
      )}

      {/* Company RECOMMENDED — same table layout as Approved */}
      {tab==='nudge' && (
        <div>
          {ALL_BUS.map(bu => {
            const rows = nudgeItems.filter(n=>n.bu===bu&&n.status!=='rejected')
            return rows.length===0 ? null : renderTable(bu, 'nudge', rows)
          })}
        </div>
      )}
    </div>
  )
}

// ── Account Priority ──────────────────────────────────────────────────────────
function AccountPriorityView({ planData, publishedData, onChange }: { planData:any; publishedData?:any; onChange:(d:any)=>void }) {
  const seed = publishedData || planData?.accountPriority
  const [items, setItems] = useState<any[]>(() => Array.isArray(seed) ? seed : (planData?.accountPriority||[]))
  useEffect(() => { onChange(items) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const update = (i:number, f:string, v:string) => {
    const n=items.map((it,idx)=>idx===i?{...it,[f]:v}:it); setItems(n); onChange(n)
  }
  const urgColors: Record<string,string> = { urgent:'var(--navy)', high:'var(--navy)', medium:'var(--navy)' }
  const urgBg:     Record<string,string> = { urgent:'var(--navy-faint)', high:'var(--navy-faint)', medium:'var(--navy-faint)' }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {items.map((item,i) => (
        <div key={i} style={{
          borderLeft:`4px solid ${urgColors[item.urgency]||'var(--border)'}`,
          borderRadius:'0 12px 12px 0', padding:18,
          background:'var(--bg-surface)',
          border:`1px solid var(--border)`,
          borderLeftColor:urgColors[item.urgency],
          boxShadow:'var(--glow-card)',
        }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:urgBg[item.urgency]||'var(--navy-faint)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13.5, fontWeight:900, color:urgColors[item.urgency]||'var(--navy)', flexShrink:0, fontFamily:'Sora,sans-serif', boxShadow:`0 0 10px ${urgColors[item.urgency]||'var(--navy)'}44` }}>
              {item.priority}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <textarea value={item.title} onChange={e=>update(i,'title',e.target.value)}
                  style={{ fontSize:15, fontWeight:800, color:'var(--text-1)', background:'transparent', border:'none', outline:'none', resize:'none', fontFamily:'Sora,sans-serif', width:'100%', lineHeight:1.4 }} rows={1}/>
                <select value={item.urgency} onChange={e=>update(i,'urgency',e.target.value)} className="select"
                  style={{ fontSize:12.5, padding:'3px 22px 3px 8px', width:'auto', flexShrink:0, color:urgColors[item.urgency], background:urgBg[item.urgency], borderColor:urgColors[item.urgency], borderRadius:8 }}>
                  <option value="urgent">URGENT</option>
                  <option value="high">HIGH</option>
                  <option value="medium">MEDIUM</option>
                </select>
              </div>
              <textarea value={item.imperative} onChange={e=>update(i,'imperative',e.target.value)}
                className="textarea-cell" style={{ width:'100%', minHeight:60, marginBottom:10, fontSize:14.5 }} placeholder="Imperative..."/>
              <div style={{ background:'var(--brand-bg)', borderRadius:8, padding:'8px 12px', display:'flex', gap:6 }}>
                <span style={{ color:'var(--brand-2)', fontWeight:800, flexShrink:0 }}>▸</span>
                <textarea value={item.freyrRelevance} onChange={e=>update(i,'freyrRelevance',e.target.value)}
                  style={{ flex:1, background:'transparent', border:'none', outline:'none', resize:'none', fontSize:14, fontFamily:'Nunito,sans-serif', fontWeight:600, color:'var(--text-1)', lineHeight:1.6 }} rows={2} placeholder="Company relevance..."/>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button onClick={()=>{const n=[...items,{priority:items.length+1,title:'New Priority',imperative:'',freyrRelevance:'',urgency:'medium'}];setItems(n);onChange(n)}}
        className="btn btn-ghost" style={{ display:'flex',alignItems:'center',gap:5 }}>
        <Plus size={14}/> Add Priority
      </button>
    </div>
  )
}

// ── Emerging Pipeline ─────────────────────────────────────────────────────────
function EmergingPipelineView({ planData, publishedData, onChange }: { planData:any; publishedData?:any; onChange:(d:any)=>void }) {
  const seed = publishedData || planData?.emergingPipeline
  const [worked, setWorked] = useState((seed?.worked || planData?.emergingPipeline?.worked||[]).join('\n'))
  const [didnt,  setDidnt]  = useState((seed?.didntWork || planData?.emergingPipeline?.didntWork||[]).join('\n'))
  const upd = (w:string, d:string) => onChange({ target: seed?.target || planData?.emergingPipeline?.target, worked:w.split('\n').filter(Boolean), didntWork:d.split('\n').filter(Boolean) })
  useEffect(() => { upd(worked, didnt) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <div className="section-heading glow" style={{ fontSize:15, marginBottom:14 }}>Target</div>
      <div style={{ padding:'14px 18px', background:'var(--bg-raised)', borderRadius:10, border:'1px solid var(--border)', fontSize:14.5, color:'var(--text-2)', lineHeight:1.7, marginBottom:22, boxShadow:'var(--glow-card)' }}>
        {planData?.emergingPipeline?.target||'No target data.'}
      </div>
      <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {[{color:'var(--navy)',label:'What worked?',val:worked,set:(v:string)=>{setWorked(v);upd(v,didnt)},bg:'var(--navy-faint)'},{color:'var(--navy)',label:"What didn't work?",val:didnt,set:(v:string)=>{setDidnt(v);upd(worked,v)},bg:'var(--navy-faint)'}].map(c=>(
          <div key={c.label}>
            <div style={{ fontSize:14.5, fontWeight:800, color:c.color, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:9, height:9, borderRadius:'50%', background:c.color, display:'inline-block', boxShadow:`0 0 8px ${c.color}` }}/>
              {c.label}
            </div>
            <textarea value={c.val} onChange={e=>c.set(e.target.value)}
              className="textarea-cell" style={{ width:'100%', minHeight:180, resize:'both', fontSize:14.5, background:`linear-gradient(135deg, ${c.bg}, var(--bg-raised))` }}
              placeholder="- Point 1&#10;- Point 2"/>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Power Centres ─────────────────────────────────────────────────────────────
function PowerCentresView({ planData, publishedData, onChange }: { planData:any; publishedData?:any; onChange:(d:any)=>void }) {
  const seed = publishedData || planData?.powerCentres
  const [rows, setRows] = useState<any[]>(()=> Array.isArray(seed) ? seed : (planData?.powerCentres||[]))
  useEffect(() => { onChange(rows) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const [editIdx, setEditIdx] = useState<number|null>(null)
  const [editData, setEditData] = useState<any>(null)
  const rel_c: Record<string,string> = { 'Active':'var(--navy)','Warm — ACTIVE':'var(--navy)','Cold':'var(--navy)','Warm':'var(--navy)','Cold — HIGHEST PRIORITY':'var(--navy)','active':'var(--navy)' }
  const getColor = (r:string) => rel_c[r] || 'var(--navy)'

  const AVATARS = ['#1B365D','#244878','#2e5a96','#1B365D','#244878','#2e5a96','#1B365D','#244878']
  const initials = (name:string) => name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <div className="section-heading glow" style={{ fontSize:15 }}>Power Centres — Responsible</div>
        <button className="btn btn-brand btn-sm" onClick={()=>{const n={name:'New Person',title:'',budget:'',relationship:'Cold',img:''};setRows(p=>[...p,n]);setEditIdx(rows.length);setEditData({...n})}}>
          <Plus size={13}/> Add Person
        </button>
      </div>
      <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {rows.map((row, i) => {
          const sc = getColor(row.relationship)
          const av = AVATARS[i%AVATARS.length]
          return (
            <div key={i} style={{ border:`1px solid var(--border)`, borderRadius:14, overflow:'hidden', background:'var(--bg-surface)', boxShadow:'var(--glow-card)', transition:'all 200ms' }}
              onMouseEnter={e=>(e.currentTarget.style.boxShadow='var(--glow-card-hover)')}
              onMouseLeave={e=>(e.currentTarget.style.boxShadow='var(--glow-card)')}>
              {/* Header band */}
              <div style={{ height:5, background:`linear-gradient(90deg, ${sc}, ${sc}44)` }}/>
              <div style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  {/* Avatar */}
                  <Avatar name={row.name||'?'} size={46} radius={23} bg={av} style={{ border:`2px solid ${av}`, boxShadow:`0 4px 12px ${av}55` }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:15, fontWeight:800, color:'var(--text-1)', fontFamily:'Sora,sans-serif', letterSpacing:'-0.01em' }}>{row.name}</div>
                    <div style={{ fontSize:13.5, color:'var(--text-2)', fontWeight:600 }}>{row.title}</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:`${sc}18`, color:sc, fontSize:16, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:sc, boxShadow:`0 0 6px ${sc}` }}/>{row.relationship.split(' —')[0]}
                  </span>
                  <div style={{ display:'flex', gap:4 }}>
                    <button title="Edit" onClick={()=>{setEditIdx(i);setEditData({...row})}} style={{ width:26, height:26, borderRadius:7, border:'1px solid var(--navy)', background:'var(--navy-faint)', cursor:'pointer', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center' }}><Pencil size={12}/></button>
                    <button onClick={()=>{const n=rows.filter((_:any,xi:number)=>xi!==i);setRows(n);onChange(n)}} style={{ width:26, height:26, borderRadius:7, border:'1px solid var(--navy)', background:'var(--navy-faint)', cursor:'pointer', fontSize:13, color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center' }}><Trash2 size={10}/></button>
                  </div>
                </div>
                <div style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>{row.budget}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit modal */}
      {editIdx!==null && editData && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width:460, padding:26 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ fontSize:16, fontWeight:800, color:'var(--text-1)', fontFamily:'Sora,sans-serif' }}>Edit Person</span>
              <button onClick={()=>setEditIdx(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)' }}><X size={18}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[{label:'Name',key:'name'},{label:'Title',key:'title'},{label:'Budget Authority',key:'budget'}].map(f=>(
                <div key={f.key}>
                  <div className="label" style={{ marginBottom:5 }}>{f.label}</div>
                  <input className="input" value={editData[f.key]||''} onChange={e=>setEditData((d:any)=>({...d,[f.key]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <div className="label" style={{ marginBottom:5 }}>Relationship</div>
                <select className="select" value={editData.relationship||'Cold'} onChange={e=>setEditData((d:any)=>({...d,relationship:e.target.value}))}>
                  {['Cold','Warm','Active','Warm — ACTIVE','Cold — HIGHEST PRIORITY'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>setEditIdx(null)}>Cancel</button>
              <button className="btn btn-brand" onClick={()=>{
                const n=rows.map((r:any,xi:number)=>xi===editIdx?{...editData}:r)
                setRows(n); onChange(n); setEditIdx(null)
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const STYLE_BLOCK = String.raw`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f1f3d; color: #fff; padding: 1.25rem 1.5rem; overflow: hidden; transition: background 0.2s, color 0.2s; }
    body.light { background: #f0f4fb; color: #1B365D; }
    .page { width: 100%; display: flex; flex-direction: column; height: 100%; gap: 0.875rem; }
    /* Nav + content layout */
    .content-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: row; gap: 0; }
    .nav-panel { width: 192px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.125rem; padding: 0.25rem 0.75rem 1rem 0; border-right: 1px solid rgba(212,175,55,0.18); overflow-y: auto; scrollbar-width: none; }
    .nav-panel::-webkit-scrollbar { display: none; }
    @media (max-width: 900px) { .nav-panel { width: 150px; } }
    .nav-item { display: flex; flex-direction: column; gap: 0.2rem; text-align: left; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid transparent; background: transparent; cursor: pointer; transition: background 0.15s, border-color 0.15s; width: 100%; color: inherit; font-family: inherit; }
    .nav-item:hover { background: rgba(255,255,255,0.06); }
    .nav-item.active { background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.3); border-left: 2px solid #D4AF37; padding-left: calc(0.75rem - 1px); }
    .nav-num { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; color: rgba(212,175,55,0.65); line-height: 1; display: block; }
    .nav-title { font-size: 0.7rem; font-weight: 500; color: rgba(255,255,255,0.7); line-height: 1.35; display: block; }
    .nav-item.active .nav-title { color: #fff; font-weight: 600; }
    .main-panel { flex: 1; min-width: 0; min-height: 0; overflow-y: auto; padding-left: 1.25rem; scrollbar-width: thin; scrollbar-color: rgba(212,175,55,0.35) transparent; }
    .main-panel::-webkit-scrollbar { width: 4px; }
    .main-panel::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.35); border-radius: 2px; }
    .sections { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 1rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.875rem; border-bottom: 2px solid rgba(212,175,55,0.4); flex-shrink: 0; }
    .account-name { font-size: 1rem; font-weight: 600; color: #fff; }
    .badge { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #1B365D; background: #D4AF37; padding: 0.2rem 0.6rem; border-radius: 20px; }
    .page-date { font-size: 0.8125rem; color: rgba(255,255,255,0.55); margin-top: 0.25rem; }
    .section { display: flex; flex-direction: column; gap: 1rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(212,175,55,0.35); border-radius: 10px; padding: 1rem 1.25rem; }
    .section--placeholder { border-style: dashed; opacity: 0.5; }
    .section-header { display: flex; align-items: center; gap: 0.75rem; padding-bottom: 0.625rem; border-bottom: 1px solid rgba(212,175,55,0.3); }
    .section-number { font-size: 1.125rem; font-weight: 700; color: #D4AF37; font-variant-numeric: tabular-nums; line-height: 1; }
    .section-title { font-size: 0.9375rem; font-weight: 600; color: #fff; letter-spacing: 0.02em; text-transform: uppercase; }
    .placeholder-text { font-size: 0.8125rem; color: rgba(255,255,255,0.4); font-style: italic; margin: 0; }
    .no-data { font-size: 0.8125rem; color: rgba(255,255,255,0.4); font-style: italic; }
    /* Sec 1 */
    .recap-grid { display: flex; flex-direction: column; gap: 0.875rem; }
    .bu-pillar { background: rgba(255,255,255,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 0.875rem 1rem; display: flex; flex-direction: column; gap: 0.875rem; }
    .bu-pillar-title { font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #D4AF37; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(212,175,55,0.25); }
    .recap-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
    .recap-table th { text-align: left; font-size: 0.6875rem; font-weight: 600; color: rgba(255,255,255,0.5); padding: 0.375rem 0.625rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .recap-table td { padding: 0.4rem 0.625rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; line-height: 1.5; color: rgba(255,255,255,0.85); }
    .recap-table tr:last-child td { border-bottom: none; }
    .recap-bu-cell { font-weight: 700; color: #fff; letter-spacing: 0.04em; white-space: nowrap; }
    .recap-cell { white-space: pre-wrap; word-break: break-word; }
    .critical-block { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4); border-radius: 8px; padding: 0.875rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .critical-badge { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #f87171; }
    .critical-content { font-size: 0.875rem; color: #fff; margin: 0; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    /* Sec 3 */
    .bets-subsection { display: flex; flex-direction: column; gap: 0.75rem; }
    .bets-subsection-title { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(212,175,55,0.8); padding-bottom: 0.5rem; border-bottom: 1px solid rgba(212,175,55,0.15); margin: 0; }
    .bets-grid { display: flex; flex-direction: column; gap: 0.625rem; }
    .bets-divider { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0; }
    .bets-bu-block { display: flex; flex-direction: column; gap: 0.4rem; }
    .bets-bu-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(212,175,55,0.75); background: rgba(212,175,55,0.08); border-radius: 4px; padding: 0.125rem 0.5rem; align-self: flex-start; margin-bottom: 0.2rem; }
    .bet-cards { display: flex; flex-direction: column; gap: 0.5rem; }
    .bet-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; overflow: hidden; }
    .bet-header { display: flex; align-items: flex-start; gap: 0.375rem; min-width: 0; }
    .bet-index { font-size: 0.6875rem; color: rgba(212,175,55,0.6); font-weight: 700; flex-shrink: 0; padding-top: 0.1rem; }
    .bet-focus { font-size: 0.875rem; font-weight: 600; color: #fff; word-break: break-word; overflow-wrap: break-word; min-width: 0; line-height: 1.4; }
    .bet-acv { font-size: 0.6875rem; font-weight: 600; color: #1B365D; background: #D4AF37; border-radius: 10px; padding: 0.15rem 0.55rem; align-self: flex-start; white-space: normal; word-break: break-word; max-width: 100%; line-height: 1.4; }
    .bet-field { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
    .bet-label { font-size: 0.6875rem; color: rgba(255,255,255,0.45); letter-spacing: 0.03em; flex-shrink: 0; }
    .bet-value { font-size: 0.8125rem; color: rgba(255,255,255,0.85); line-height: 1.5; margin: 0; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word; }
    .bet-list { font-size: 0.8125rem; color: rgba(255,255,255,0.85); line-height: 1.55; padding-left: 1.1rem; margin: 0; word-break: break-word; overflow-wrap: break-word; }
    .bet-list li+li { margin-top: 0.2rem; }
    /* Sec 5 (briefing export CSS below keeps its own palette) */
    .ci-subsection { display: flex; flex-direction: column; gap: 0.75rem; }
    .ci-subsection-title { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(212,175,55,0.8); padding-bottom: 0.5rem; border-bottom: 1px solid rgba(212,175,55,0.15); margin: 0; }
    .ci-divider { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0; }
    .ci-tables { display: flex; flex-direction: column; gap: 0.875rem; }
    .ci-bu-block { display: flex; flex-direction: column; gap: 0.4rem; }
    .ci-bu-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(212,175,55,0.75); background: rgba(212,175,55,0.08); border-radius: 4px; padding: 0.125rem 0.5rem; align-self: flex-start; }
    .ci-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
    .ci-table th { text-align: left; font-size: 0.6875rem; color: rgba(255,255,255,0.5); font-weight: 600; padding: 0.375rem 0.625rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .ci-table td { padding: 0.4rem 0.625rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; line-height: 1.5; color: rgba(255,255,255,0.85); word-break: break-word; }
    .ci-table tr:last-child td { border-bottom: none; }
    .ci-comp { font-weight: 600; color: #fff; width: 30%; min-width: 120px; }
    .ci-remarks { color: rgba(255,255,255,0.8); }
    /* Sec 2 */
    .bh { display: flex; flex-direction: column; gap: 1rem; }
    .bh-table-wrap { overflow-x: auto; }
    .bh-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 0.8125rem; min-width: 480px; }
    .bh-table th { text-align: left; font-size: 0.6875rem; color: rgba(255,255,255,0.5); font-weight: 600; padding: 0.375rem 0.625rem; border-bottom: 1px solid rgba(255,255,255,0.1); white-space: nowrap; }
    .bh-table td { padding: 0.375rem 0.625rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); vertical-align: middle; }
    .bh-table td:first-child { color: rgba(255,255,255,0.5); font-size: 0.6875rem; white-space: nowrap; }
    .bh-target td { color: rgba(212,175,55,0.85); }
    .bh-actuals td { color: #fff; font-weight: 600; }
    .bh-variance td { color: rgba(255,255,255,0.6); font-style: italic; }
    .bh-block-title { font-size: 0.8125rem; font-weight: 700; color: rgba(212,175,55,0.9); margin-bottom: 0.5rem; }
    .bh-table--focus td { color: rgba(255,255,255,0.85); }
    .bh-account-block + .bh-account-block { margin-top: 1.75rem; }
    .bh-account-label { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(148,163,184,0.35); }
    .opp-qtr-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em; color: rgba(212,175,55,0.85); margin: 0.75rem 0 0.375rem; }
    .opp-qtr-title:first-of-type { margin-top: 0.25rem; }
    .bh-table--opp td:first-child { color: rgba(255,255,255,0.85); font-size: 0.8125rem; white-space: normal; }
    .bh-table--opp td { vertical-align: top; word-break: break-word; }
    body.light .opp-qtr-title { color: #1B365D; }
    body.light .bh-table--focus td { color: rgba(27,54,93,0.8); }
    body.light .bh-table--opp td:first-child { color: rgba(27,54,93,0.8); }
    .bh-strategies { display: flex; flex-direction: column; gap: 0.75rem; }
    .bh-total-row td { font-weight: 700; border-top: 2px solid rgba(212,175,55,0.3); }
    body.light .bh-total-row td { border-top-color: rgba(27,54,93,0.3); }
    .bh-strategy-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.15); border-radius: 6px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .bh-strategy-label { font-size: 0.6875rem; color: rgba(212,175,55,0.8); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
    .bh-strategy-value { font-size: 0.8125rem; color: rgba(255,255,255,0.85); line-height: 1.55; word-break: break-word; overflow-wrap: break-word; }
    .bh-disclaimer { margin-top: 0.75rem; padding-top: 0.625rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .bh-disclaimer p { font-size: 0.6875rem; color: rgba(255,255,255,0.45); font-style: italic; line-height: 1.5; margin: 0; }
    .bh-disclaimer p + p { margin-top: 0.25rem; }
    /* Sec 4 */
    .sh-org-chart-hint { font-size: 0.8125rem; color: rgba(255,255,255,0.4); font-style: italic; margin: 0; padding: 1rem 0.875rem; }
    .sh-avatar { width: 2.25rem; height: 2.25rem; border-radius: 50%; object-fit: cover; border: 2px solid rgba(212,175,55,0.35); flex-shrink: 0; }
    .sh-avatar-initials { width: 2.25rem; height: 2.25rem; border-radius: 50%; background: rgba(212,175,55,0.15); border: 2px solid rgba(212,175,55,0.3); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #D4AF37; flex-shrink: 0; }
    .sh-org-chart { margin-top: 1.25rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; overflow: hidden; }
    .sh-org-chart-img { width: 100%; display: block; }
    .sh-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.875rem; }
    .sh-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 0.875rem; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; overflow: hidden; }
    .sh-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; flex-wrap: nowrap; }
    .sh-card-header-main { display: flex; align-items: center; gap: 0.625rem; min-width: 0; flex: 1 1 auto; }
    .sh-identity { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
    .sh-name { font-size: 0.9375rem; font-weight: 700; color: #fff; word-break: break-word; }
    .sh-designation { font-size: 0.75rem; color: rgba(255,255,255,0.55); word-break: break-word; }
    .sh-badges { display: flex; gap: 0.375rem; flex-wrap: wrap; flex-shrink: 0; justify-content: flex-end; }
    .sh-priority { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; border-radius: 10px; padding: 0.2rem 0.55rem; }
    .sh-priority--high { color: #1B365D; background: #D4AF37; }
    .sh-priority--medium { color: #1e3a5f; background: #93c5fd; }
    .sh-priority--low { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.18); }
    .sh-rel { font-size: 0.625rem; font-weight: 600; border-radius: 10px; padding: 0.2rem 0.55rem; }
    .sh-rel--hot { color: #f87171; background: rgba(248,113,113,0.15); }
    .sh-rel--warm { color: #fbbf24; background: rgba(251,191,36,0.15); }
    .sh-rel--cold { color: #93c5fd; background: rgba(147,197,253,0.15); }
    .sh-geo { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; border-radius: 10px; padding: 0.2rem 0.55rem; color: #c4b5fd; background: rgba(196,181,253,0.15); margin-left: 0.375rem; vertical-align: middle; }
    .sh-field { display: flex; flex-direction: column; gap: 0.125rem; }
    .sh-field-label { font-size: 0.6875rem; color: rgba(255,255,255,0.45); }
    .sh-field-value { font-size: 0.8125rem; color: rgba(255,255,255,0.85); line-height: 1.55; word-break: break-word; overflow-wrap: break-word; }
    /* Sec 6 */
    .dhu-image { display: flex; justify-content: center; margin-bottom: 1rem; }
    .dhu-image-img { max-width: 100%; max-height: 340px; width: auto; height: auto; object-fit: contain; border-radius: 8px; border: 1px solid rgba(212,175,55,0.2); cursor: zoom-in; transition: opacity 0.15s; }
    .dhu-image-img:hover { opacity: 0.9; }
    .dhu-remarks { background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.15); border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1rem; }
    .dhu-remarks-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(212,175,55,0.8); display: block; margin-bottom: 0.25rem; }
    .dhu-remarks-text { font-size: 0.8125rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    .dhu-updates { display: flex; flex-direction: column; gap: 0.75rem; }
    body.light .dhu-remarks { background: rgba(27,54,93,0.05); border-color: rgba(27,54,93,0.12); }
    body.light .dhu-remarks-label { color: rgba(27,54,93,0.6); }
    body.light .dhu-remarks-text { color: #1B365D; }
    /* Sec 7 */
    .priorities-grid { display: flex; flex-direction: column; gap: 0.75rem; }
    .priority-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 0.875rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .priority-index { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #D4AF37; }
    .priority-text { margin: 0; font-size: 0.875rem; color: #fff; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    body.light .priority-card { background: #f8fafc; border-color: rgba(27,54,93,0.2); }
    body.light .priority-index { color: #1B365D; }
    body.light .priority-text { color: rgba(27,54,93,0.85); }
    /* Sec 8 */
    .ns-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .ns-step { display: flex; align-items: flex-start; gap: 0.7rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-left: 3px solid var(--ns-color); border-radius: 6px; padding: 0.55rem 0.75rem; }
    .ns-step--p1 { --ns-color: #e05252; }
    .ns-step--p2 { --ns-color: #e0a83a; }
    .ns-step--p3 { --ns-color: #4a90c2; }
    .ns-idx { font-size: 0.6875rem; font-weight: 700; color: rgba(255,255,255,0.35); width: 1.1rem; flex-shrink: 0; padding-top: 0.1rem; }
    .ns-main { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
    .ns-action { font-size: 0.8125rem; line-height: 1.5; color: #fff; }
    .ns-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem; }
    .ns-priority { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #0f1f3d; background: var(--ns-color); border-radius: 9px; padding: 0.1rem 0.5rem; }
    .ns-owner { font-size: 0.6875rem; color: rgba(255,255,255,0.55); }
    .ns-owner--none { font-style: italic; color: rgba(255,255,255,0.3); }
    .ns-source { font-size: 0.6875rem; color: rgba(212,175,55,0.8); background: rgba(212,175,55,0.08); border-radius: 4px; padding: 0.08rem 0.4rem; }
    body.light .ns-step { background: #f8fafc; border-color: rgba(27,54,93,0.1); }
    body.light .ns-action { color: #1B365D; }
    body.light .ns-owner { color: rgba(27,54,93,0.55); }
    body.light .ns-source { color: #1B365D; background: rgba(27,54,93,0.07); }
    /* ── Org chart title (always shown) ── */
    .sh-org-chart-title { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(212,175,55,0.8); padding: 0.625rem 0.875rem; border-bottom: 1px solid rgba(212,175,55,0.15); }
    .sh-org-chart-img { cursor: zoom-in; transition: opacity 0.15s; }
    .sh-org-chart-img:hover { opacity: 0.9; }
    /* ── Org chart overlay (zoom) ── */
    @keyframes eb-overlay-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes eb-img-in { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .org-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 9999; overflow: hidden; cursor: zoom-out; touch-action: none; }
    .org-overlay.open { display: block; animation: eb-overlay-in 0.18s ease; }
    .org-overlay-scroll { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: default; touch-action: none; }
    .org-overlay-img { max-width: 92vw; max-height: 82vh; width: auto; height: auto; object-fit: contain; border-radius: 8px; box-shadow: 0 24px 64px rgba(0,0,0,0.6); display: block; user-select: none; -webkit-user-drag: none; animation: eb-img-in 0.18s ease; }
    .org-overlay-close { position: absolute; top: 1.25rem; right: 1.25rem; z-index: 10001; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 1.1rem; line-height: 1; font-family: inherit; transition: background 0.15s; }
    .org-overlay-close:hover { background: rgba(255,255,255,0.22); }
    .org-zoom-bar { position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 10001; display: flex; align-items: center; gap: 0.375rem; background: rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 0.375rem 0.75rem; backdrop-filter: blur(6px); }
    .org-zoom-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 1.75rem; height: 1.75rem; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; font-size: 1rem; line-height: 1; font-family: inherit; transition: background 0.12s; }
    .org-zoom-btn:hover { background: rgba(255,255,255,0.22); }
    .org-zoom-pct { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.85); min-width: 3rem; text-align: center; }
    /* ── Light theme overrides ── */
    /* Gold → navy in light */
    body.light .section-number { color: #1B365D; }
    body.light .nav-num { color: rgba(27,54,93,0.5); }
    body.light .nav-item.active { background: rgba(27,54,93,0.08); border-color: rgba(27,54,93,0.2); border-left-color: #1B365D; }
    body.light .badge { background: #1B365D; color: #fff; }
    body.light .bu-pillar-title { color: #1B365D; border-bottom-color: rgba(27,54,93,0.15); }
    body.light .recap-table th { color: rgba(27,54,93,0.55); border-bottom-color: rgba(27,54,93,0.1); }
    body.light .recap-table td { color: rgba(27,54,93,0.8); border-bottom-color: rgba(27,54,93,0.05); }
    body.light .recap-bu-cell { color: #1B365D; }
    body.light .bets-subsection-title { color: #1B365D; border-bottom-color: rgba(27,54,93,0.15); }
    body.light .bets-bu-label { color: #1B365D; background: rgba(27,54,93,0.07); }
    body.light .ci-subsection-title { color: #1B365D; border-bottom-color: rgba(27,54,93,0.15); }
    body.light .ci-bu-label { color: #1B365D; background: rgba(27,54,93,0.07); }
    body.light .dhu-bu-label { color: #1B365D; background: rgba(27,54,93,0.08); }
    body.light .bh-strategy-label { color: #1B365D; }
    body.light .bh-target td { color: rgba(27,54,93,0.65); }
    body.light .section-header { border-bottom-color: rgba(27,54,93,0.15); }
    body.light .sh-org-chart-title { color: #1B365D; border-bottom-color: rgba(27,54,93,0.12); }
    /* Surfaces / text */
    body.light .nav-item:hover { background: rgba(27,54,93,0.05); }
    body.light .nav-title { color: rgba(27,54,93,0.65); }
    body.light .nav-item.active .nav-title { color: #1B365D; font-weight: 600; }
    body.light .nav-panel { border-right-color: rgba(27,54,93,0.12); }
    body.light .page-date { color: rgba(27,54,93,0.55); }
    body.light .section { background: #fff; border-color: rgba(27,54,93,0.12); }
    body.light .section-title { color: #1B365D; }
    body.light .no-data { color: rgba(27,54,93,0.4); }
    body.light .sh-org-chart-hint { color: rgba(27,54,93,0.4); }
    body.light .bu-pillar { background: #f8fafc; border-color: rgba(27,54,93,0.1); }
    body.light .critical-content { color: #1B365D; }
    body.light .bet-card { background: #f8fafc; border-color: rgba(27,54,93,0.12); }
    body.light .bet-focus { color: #1B365D; }
    body.light .bet-value, body.light .bet-list { color: rgba(27,54,93,0.85); }
    body.light .bet-label { color: rgba(27,54,93,0.45); }
    body.light .bets-divider { border-top-color: rgba(27,54,93,0.1); }
    body.light .sh-card { background: #fff; border-color: rgba(27,54,93,0.12); }
    body.light .sh-name { color: #1B365D; }
    body.light .sh-geo { color: #7c3aed; background: rgba(124,58,237,0.12); }
    body.light .sh-designation { color: rgba(27,54,93,0.55); }
    body.light .sh-field-label { color: rgba(27,54,93,0.45); }
    body.light .sh-field-value { color: rgba(27,54,93,0.85); }
    body.light .sh-org-chart { background: #f8fafc; border-color: rgba(27,54,93,0.12); }
    body.light .ci-table th { color: rgba(27,54,93,0.55); border-bottom-color: rgba(27,54,93,0.1); }
    body.light .ci-table td { color: rgba(27,54,93,0.8); border-bottom-color: rgba(27,54,93,0.05); }
    body.light .ci-comp { color: #1B365D; }
    body.light .ci-remarks { color: rgba(27,54,93,0.75); }
    body.light .ci-divider { border-top-color: rgba(27,54,93,0.1); }
    body.light .bh-table th { color: rgba(27,54,93,0.55); border-bottom-color: rgba(27,54,93,0.1); }
    body.light .bh-table td { color: rgba(27,54,93,0.8); border-bottom-color: rgba(27,54,93,0.05); }
    body.light .bh-table td:first-child { color: rgba(27,54,93,0.55); }
    body.light .bh-block-title { color: #1B365D; }
    body.light .bh-account-label { color: #1B365D; border-bottom-color: rgba(27,54,93,0.15); }
    body.light .bh-actuals td { color: #1B365D; }
    body.light .bh-variance td { color: rgba(27,54,93,0.6); }
    body.light .bh-strategy-card { background: #f8fafc; border-color: rgba(27,54,93,0.1); }
    body.light .bh-strategy-value { color: rgba(27,54,93,0.85); }
    body.light .bh-disclaimer { border-top-color: rgba(27,54,93,0.1); }
    body.light .bh-disclaimer p { color: rgba(27,54,93,0.45); }
    /* Theme toggle button */
    .theme-btn { display: flex; align-items: center; gap: 0.375rem; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.35); border-radius: 6px; padding: 0.35rem 0.65rem; font-size: 0.75rem; font-weight: 600; color: rgba(212,175,55,0.9); cursor: pointer; transition: background 0.15s; font-family: inherit; }
    .theme-btn:hover { background: rgba(212,175,55,0.18); }
    body.light .theme-btn { background: rgba(27,54,93,0.07); border-color: rgba(27,54,93,0.25); color: #1B365D; }
    body.light .theme-btn:hover { background: rgba(27,54,93,0.12); }
    .header-actions { display: flex; align-items: center; gap: 0.5rem; }
    @media print {
      html, body { height: auto; overflow: visible; }
      .content-wrapper { flex-direction: column; }
      .nav-panel { display: none; }
      .main-panel { overflow: visible; }
      body { background: #0f1f3d !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `
const SCRIPT_BLOCK = String.raw`
    (function () {
      var panel = document.getElementById('main-panel');

      // ── Scroll-spy nav ──
      function setActive(id) {
        document.querySelectorAll('.nav-item').forEach(function (btn) {
          btn.classList.toggle('active', btn.getAttribute('data-target') === id);
        });
      }
      document.querySelectorAll('.nav-item').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-target');
          var el = document.getElementById(id);
          if (!el || !panel) return;
          var panelTop = panel.getBoundingClientRect().top;
          var elTop = el.getBoundingClientRect().top;
          panel.scrollTo({ top: elTop - panelTop + panel.scrollTop, behavior: 'smooth' });
          setActive(id);
        });
      });
      var observer = new IntersectionObserver(function (entries) {
        var visible = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
        if (visible.length) setActive(visible[0].target.id);
      }, { root: panel, rootMargin: '0px 0px -40% 0px', threshold: 0 });
      ['s01','s02','s03','s04','s05','s06','s07','s08'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      // ── Image zoom overlays (org chart + delivery health image) ──
      // Mirrors the on-page ImageLightbox component: ctrl/cmd+wheel (or trackpad pinch,
      // which reports ctrlKey) zooms; plain two-finger scroll pans instead of zooming,
      // on both Windows and Mac. Pan is clamped to the image's real rendered edges so
      // drag/scroll panning always reaches the full left/right/top/bottom extent.
      function setupZoomOverlay(prefix, thumbId) {
        var thumb        = document.getElementById(thumbId);
        var overlay      = document.getElementById(prefix + '-overlay');
        var closeBtn     = document.getElementById(prefix + '-overlay-close');
        var overlayImg   = document.getElementById(prefix + '-overlay-img');
        var overlayScroll= document.getElementById(prefix + '-overlay-scroll');
        var zoomInBtn    = document.getElementById(prefix + '-zoom-in');
        var zoomOutBtn   = document.getElementById(prefix + '-zoom-out');
        var zoomResetBtn = document.getElementById(prefix + '-zoom-reset');
        var zoomPct      = document.getElementById(prefix + '-zoom-pct');
        var ZOOM_STEP = 0.25, ZOOM_MIN = 1, ZOOM_MAX = 6;
        var zoom = 1, offX = 0, offY = 0, dragging = false, dragStart = null;

        function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

        function clampOffset(x, y, z) {
          if (!overlayScroll || !overlayImg || !overlayImg.naturalWidth) return { x: x, y: y };
          var rect = overlayScroll.getBoundingClientRect();
          var fit = Math.min(rect.width / overlayImg.naturalWidth, rect.height / overlayImg.naturalHeight, 1);
          var rw = overlayImg.naturalWidth * fit * z;
          var rh = overlayImg.naturalHeight * fit * z;
          var maxX = Math.max(0, (rw - rect.width) / 2);
          var maxY = Math.max(0, (rh - rect.height) / 2);
          return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
        }

        function render() {
          if (overlayImg) {
            overlayImg.style.transform = 'translate(' + offX + 'px, ' + offY + 'px) scale(' + zoom + ')';
            overlayImg.style.cursor = zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default';
          }
          if (zoomPct) zoomPct.textContent = Math.round(zoom * 100) + '%';
        }

        function applyZoom(z) {
          zoom = clamp(z, ZOOM_MIN, ZOOM_MAX);
          var c = clampOffset(offX, offY, zoom);
          offX = c.x; offY = c.y;
          render();
        }
        function panBy(dx, dy) {
          if (zoom <= 1) return;
          var c = clampOffset(offX + dx, offY + dy, zoom);
          offX = c.x; offY = c.y;
          render();
        }
        function panTo(x, y) {
          var c = clampOffset(x, y, zoom);
          offX = c.x; offY = c.y;
          render();
        }
        function openOverlay() {
          if (!overlay) return;
          overlay.classList.add('open');
          zoom = 1; offX = 0; offY = 0;
          render();
        }
        function closeOverlay() { if (overlay) overlay.classList.remove('open'); }

        if (thumb)        thumb.addEventListener('click', openOverlay);
        if (closeBtn)     closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeOverlay(); });
        if (overlayScroll) overlayScroll.addEventListener('click', function(e) { e.stopPropagation(); });
        if (overlay)      overlay.addEventListener('click', closeOverlay);
        if (zoomInBtn)    zoomInBtn.addEventListener('click', function(e)    { e.stopPropagation(); applyZoom(zoom + ZOOM_STEP); });
        if (zoomOutBtn)   zoomOutBtn.addEventListener('click', function(e)   { e.stopPropagation(); applyZoom(zoom - ZOOM_STEP); });
        if (zoomResetBtn) zoomResetBtn.addEventListener('click', function(e) { e.stopPropagation(); applyZoom(1); });

        if (overlayScroll) overlayScroll.addEventListener('wheel', function(e) {
          if (!overlay || !overlay.classList.contains('open')) return;
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) { applyZoom(zoom - e.deltaY * 0.0015); return; }
          panBy(-e.deltaX, -e.deltaY);
        }, { passive: false });

        if (overlayImg) {
          overlayImg.addEventListener('pointerdown', function(e) {
            if (zoom <= 1) return;
            dragging = true;
            dragStart = { x: e.clientX, y: e.clientY, ox: offX, oy: offY };
            overlayImg.setPointerCapture(e.pointerId);
            render();
          });
          overlayImg.addEventListener('pointermove', function(e) {
            if (!dragStart) return;
            panTo(dragStart.ox + (e.clientX - dragStart.x), dragStart.oy + (e.clientY - dragStart.y));
          });
          var endDrag = function() { dragging = false; dragStart = null; render(); };
          overlayImg.addEventListener('pointerup', endDrag);
          overlayImg.addEventListener('pointercancel', endDrag);
        }

        document.addEventListener('keydown', function(e) {
          if (!overlay || !overlay.classList.contains('open')) return;
          if (e.key === 'Escape')        closeOverlay();
          if (e.key === '+' || e.key === '=') applyZoom(zoom + ZOOM_STEP);
          if (e.key === '-')             applyZoom(zoom - ZOOM_STEP);
          if (e.key === '0')             applyZoom(1);
        });
      }
      setupZoomOverlay('org', 'org-chart-thumb');
      setupZoomOverlay('dhu', 'dhu-image-thumb');

      // ── Theme toggle ──
      var toggleBtn = document.getElementById('theme-toggle');
      var iconSun   = document.getElementById('theme-icon-sun');
      var iconMoon  = document.getElementById('theme-icon-moon');
      var label     = document.getElementById('theme-label');
      var isLight   = document.body.classList.contains('light');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          isLight = !isLight;
          document.body.classList.toggle('light', isLight);
          if (iconSun)  iconSun.style.display  = isLight ? 'none' : '';
          if (iconMoon) iconMoon.style.display = isLight ? '' : 'none';
          if (label)    label.textContent = isLight ? 'Dark' : 'Light';
        });
      }

      // ── Full screen toggle ──
      var fsBtn = document.getElementById('fs-toggle');
      var fsLabel = document.getElementById('fs-label');
      function fsElem(){ return document.fullscreenElement || document.webkitFullscreenElement; }
      function syncFs(){ if (fsLabel) fsLabel.textContent = fsElem() ? 'Exit full screen' : 'Full screen'; }
      if (fsBtn) {
        fsBtn.addEventListener('click', function () {
          try {
            if (fsElem()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
            else { var el = document.documentElement; var r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el); if (r && r.catch) r.catch(function(){}); }
          } catch (e) {}
        });
        document.addEventListener('fullscreenchange', syncFs);
        document.addEventListener('webkitfullscreenchange', syncFs);
      }
    })();
  `

// ── Full presentation HTML export (matches reference briefing layout) ─────────
function buildPresentationHtml(
  accountName: string,
  accountId: string,
  plan: any,
  sectionData: Record<string,any>
): string {
  const esc = (s:any) => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const nl2br = (s:any) => esc(s).replace(/\n/g,'<br>')
  const get = (key:string) => { const d = sectionData[key]; if (d!=null && !(Array.isArray(d)?d.length===0:typeof d==='object'&&Object.keys(d).length===0)) return d; return undefined }

  const RECAP_GROUPS = ['Significant GTM Development','Significant Deal / RFP / RFI Updates','Miscellaneous Updates','Significant Delivery Updates']
  const BUS = ['ECS','EMS','OTHERS']

  // ── data resolution ──
  const recapRaw = get('Account Review Recap') ?? { rows: plan?.accountReviewRecap?.rows }
  const recapRows: any[] = Array.isArray(recapRaw?.rows) ? recapRaw.rows : (Array.isArray(recapRaw) ? recapRaw : [])
  const bh = get('Business Health') ?? businessHealthFor(accountId) ?? businessHealthFor('astrazeneca')
  const bigBetsSrc = get('Our Big Bets')
  const bigBets: any[] = (() => { if (bigBetsSrc?.bigBets) return bigBetsSrc.bigBets; if (Array.isArray(bigBetsSrc)) return bigBetsSrc; return plan?.bigBets ?? [] })()
  const power: any[] = (() => { const d = get('Power Centres Responsible'); return Array.isArray(d) ? d : (plan?.powerCentres ?? []) })()
  const compGroups: any[] = (() => { const d = get('Competition Update'); return Array.isArray(d?.groups) ? d.groups : competitionUpdateFor(accountId) })()
  const du = get('Delivery Health Update') ?? {}
  const duRows: any[] = Array.isArray(du?.rows) ? du.rows : deliveryUpdatesFor(accountId)
  const duImage: string = du?.image || ''
  const steps: any[] = (() => { const d = get('Immediate Next Steps'); return Array.isArray(d?.steps) ? d.steps : immediateStepsFor(accountId) })()
  const priorities: any[] = (() => { const d = get('Account Priority'); return Array.isArray(d) ? d : (plan?.accountPriority ?? []) })()

  // live delivery remarks
  const engs = engagementsForAccount(accountId)
  const dRemarks = engs.filter((e:any)=>ragOf(e.rag_status)!=='green').slice(0,4)
    .map((e:any)=>`Prioritize ${e.name} (${ragOf(e.rag_status)==='red'?'Critical':'Needs attention'}). ${e.root_cause.slice(0,120)}…`)

  // ── section builders ──
  const s01 = () => {
    const pillars = RECAP_GROUPS.map(g => {
      const rows = BUS.map(bu => recapRows.find((r:any)=>r.category===g&&r.bu===bu) || { bu, whereWeLeftOff:'', updateOnProgress:'', nextSteps:'' })
      if (!rows.some(r=>r.whereWeLeftOff||r.updateOnProgress||r.nextSteps)) return ''
      return `<div class="bu-pillar"><div class="bu-pillar-title">${esc(g)}</div><table class="recap-table"><thead><tr><th>BU</th><th>Where We Left Off</th><th>Update on Progress</th><th>Next Steps</th></tr></thead><tbody>${rows.map(r=>`<tr class="recap-row"><td class="recap-bu-cell">${esc(r.bu)}</td><td class="recap-cell">${nl2br(r.whereWeLeftOff||'—')}</td><td class="recap-cell">${nl2br(r.updateOnProgress||'—')}</td><td class="recap-cell">${nl2br(r.nextSteps||'—')}</td></tr>`).join('')}</tbody></table></div>`
    }).filter(Boolean).join('')
    return pillars ? `<div class="recap-grid">${pillars}</div>` : `<p class="no-data">No recap recorded.</p>`
  }

  const numTable = (title:string, rows:any[]) => `<div class="bh-table-wrap">${title?`<div class="bh-block-title">${esc(title)}</div>`:''}<table class="bh-table"><thead><tr><th>Amount (in $M)</th><th>Q1'27</th><th>Q2'27</th><th>Q3'27</th><th>Q4'27</th><th>Total</th></tr></thead><tbody>${rows.map(r=>{ const cls = /variance/i.test(r.label)?'bh-variance':/actual/i.test(r.label)?'bh-actuals':'bh-target'; return `<tr class="${cls}"><td>${esc(r.label)}</td>${r.q.map((v:string)=>`<td>${esc(v||'—')}</td>`).join('')}<td>${esc(r.total||'—')}</td></tr>` }).join('')}</tbody></table></div>`
  const s02 = () => {
    if (!bh) return `<p class="no-data">No business health data.</p>`
    const focus = `<div class="bh-table-wrap"><div class="bh-block-title">Focus Themes</div><table class="bh-table bh-table--focus"><thead><tr><th>FY'27 Estimates</th><th>Booking (in $k)</th><th>Revenue Q1 FY '27 (in $k)</th></tr></thead><tbody>${(bh.focusThemes||[]).map((t:any)=>`<tr><td>${esc(t.area)}</td><td>${esc(t.booking||'—')}</td><td>${esc(t.revenue||'—')}</td></tr>`).join('')}</tbody></table></div>`
    const opps = (bh.opportunities||[]).map((g:any)=>`<div class="opp-qtr-title">${esc(g.qtr)}</div><table class="bh-table bh-table--opp"><thead><tr><th>Deal</th><th>Competition</th><th>ACV</th><th>Est Closing</th><th>Status</th><th>Comments</th></tr></thead><tbody>${(g.rows||[]).map((r:any)=>`<tr><td>${esc(r.deal)}</td><td>${esc(r.competition)}</td><td>${esc(r.acv)}</td><td>${esc(r.estClosing)}</td><td>${esc(r.status)}</td><td>${nl2br(r.comments)}</td></tr>`).join('')}</tbody></table>`).join('')
    return `<div class="bh">${numTable('Bookings', bh.bookings||[])}${numTable('Revenues', bh.revenues||[])}${focus}<div class="bh-table-wrap"><div class="bh-block-title">&ge; 1 Mn Opportunities Mapped to Top Deals</div>${opps}</div>${bh.forecast?`<div class="bh-strategies"><div class="bh-strategy-card"><span class="bh-strategy-label">Overall Forecast</span><div class="bh-strategy-value">${nl2br(bh.forecast)}</div></div></div>`:''}</div>`
  }

  const s03 = () => {
    if (!bigBets.length) return `<p class="no-data">No big bets recorded.</p>`
    const blocks = bigBets.map((bu:any)=>`<div class="bets-bu-block"><div class="bets-bu-label">${esc(bu.bu)}</div><div class="bet-cards">${(bu.rows||[]).map((r:any,i:number)=>`<div class="bet-card"><div class="bet-header"><span class="bet-index">#${i+1}</span><span class="bet-focus">${esc(r.focus)}</span></div>${r.acv?`<span class="bet-acv">${esc(String(r.acv).match(/^[0-9.]+$/)?'$'+r.acv+'M':r.acv)}</span>`:''}${(r.details||[]).length?`<div class="bet-field"><span class="bet-label">Details</span><ul class="bet-list">${(r.details||[]).map((d:string)=>`<li>${esc(d)}</li>`).join('')}</ul></div>`:''}${r.stakeholder?`<div class="bet-field"><span class="bet-label">Stakeholders</span><div class="bet-value">${esc(r.stakeholder)}</div></div>`:''}${r.nextSteps?`<div class="bet-field"><span class="bet-label">Next Steps</span><div class="bet-value">${esc(r.nextSteps)}</div></div>`:''}</div>`).join('')}</div></div>`).join('')
    return `<div class="bets-subsection"><div class="bets-subsection-title">Review of Already-Identified Big Bets ($1M+ Deals) — Progress, Updates &amp; Next Steps</div><div class="bets-grid">${blocks}</div></div>`
  }

  const s04 = () => {
    if (!power.length) return `<p class="no-data">No key relationships recorded.</p>`
    const relClass = (r:string) => { const k=(r||'').toLowerCase(); if (k.includes('active')||k.includes('warm')) return 'sh-rel--warm'; if (k.includes('hot')) return 'sh-rel--hot'; return 'sh-rel--cold' }
    const relLabel = (r:string) => { const k=(r||'').toLowerCase(); if (k.includes('active')||k.includes('warm')) return '☀️ Warm'; if (k.includes('hot')) return '🔥 Hot'; return '🧊 Cold' }
    const initials = (n:string) => (n||'?').split(' ').filter((_:any,i:number)=>i<2).map((w:string)=>w[0]||'').join('').toUpperCase()
    const cards = power.map((p:any)=>`<div class="sh-card"><div class="sh-card-header"><div class="sh-card-header-main"><div class="sh-avatar-initials">${esc(initials(p.name))}</div><div class="sh-identity"><div class="sh-name">${esc(p.name)}</div><div class="sh-designation">${esc(p.title)}</div></div></div><div class="sh-badges"><span class="sh-priority sh-priority--high">High Priority</span><span class="sh-rel ${relClass(p.relationship)}">${relLabel(p.relationship)}</span></div></div>${p.budget?`<div class="sh-field"><div class="sh-field-label">Budget Authority</div><div class="sh-field-value">${esc(p.budget)}</div></div>`:''}${p.nextAction?`<div class="sh-field"><div class="sh-field-label">Next Action</div><div class="sh-field-value">${esc(p.nextAction)}</div></div>`:''}</div>`).join('')
    return `<div class="sh-grid">${cards}</div>`
  }

  const s05 = () => {
    const has = compGroups.some((g:any)=>(g.rows||[]).some((r:any)=>r.competition||r.remarks))
    if (!has) return `<div class="ci-subsection"><div class="ci-subsection-title">Known Competitive Activity in This Account</div><p class="no-data">No competitive activity recorded.</p></div>`
    const blocks = compGroups.map((g:any)=>{ const rows=(g.rows||[]).filter((r:any)=>r.competition||r.remarks); if(!rows.length) return ''; return `<div class="ci-bu-block"><div class="ci-bu-label">${esc(g.group)}</div><table class="ci-table"><thead><tr><th>Competition</th><th>Remarks</th></tr></thead><tbody>${rows.map((r:any)=>`<tr><td class="ci-comp">${nl2br(r.competition)}</td><td class="ci-remarks">${nl2br(r.remarks)}</td></tr>`).join('')}</tbody></table></div>` }).filter(Boolean).join('')
    return `<div class="ci-subsection"><div class="ci-subsection-title">Known Competitive Activity in This Account</div><div class="ci-tables">${blocks}</div></div>`
  }

  const s06 = () => {
    const img = duImage ? `<div class="dhu-image"><img id="dhu-image-thumb" class="dhu-image-img" src="${duImage}" alt="Delivery health snapshot" /></div>` : ''
    const rem = dRemarks.length ? `<div class="dhu-remarks"><span class="dhu-remarks-label">Remarks</span><div class="dhu-remarks-text">${dRemarks.map((r:string)=>'• '+esc(r)).join('<br>')}</div></div>` : ''
    const rows = duRows.filter((r:any)=>r.topic||r.update||r.next)
    const table = rows.length ? `<div class="ci-tables"><div class="ci-bu-block"><table class="ci-table"><thead><tr><th>Category</th><th>Topic</th><th>Update on Progress</th><th>Next Steps</th></tr></thead><tbody>${rows.map((r:any)=>`<tr><td class="ci-comp">${esc(r.category)}</td><td class="ci-remarks">${nl2br(r.topic)}</td><td class="ci-remarks">${nl2br(r.update)}</td><td class="ci-remarks">${nl2br(r.next)}</td></tr>`).join('')}</tbody></table></div></div>` : ''
    return (img||rem||table) ? `${img}${rem}${table}` : `<p class="no-data">No delivery updates recorded.</p>`
  }

  const s07 = () => {
    if (!steps.length) return `<div class="ns-list"><p class="no-data">No immediate next steps identified.</p></div>`
    return `<div class="ns-list">${steps.map((s:any,i:number)=>{ const p=(s.priority||'P2').toLowerCase(); return `<div class="ns-step ns-step--${p}"><span class="ns-idx">${i+1}</span><div class="ns-main"><div class="ns-action">${esc(s.text)}</div><div class="ns-meta"><span class="ns-priority">${esc(s.priority||'P2')}</span><span class="ns-owner ${(!s.owner||/no owner/i.test(s.owner))?'ns-owner--none':''}">${esc(s.owner||'No owner named')}</span>${(s.tags||[]).map((t:string)=>`<span class="ns-source">${esc(t)}</span>`).join('')}</div></div></div>` }).join('')}</div>`
  }

  const s08 = () => {
    if (!priorities.length) return `<p class="no-data">No account priorities recorded.</p>`
    return `<div class="priorities-grid">${priorities.map((p:any,i:number)=>`<div class="priority-card"><div class="priority-index">Priority ${p.priority||i+1}</div><p class="priority-text">${nl2br([p.title, p.imperative, p.freyrRelevance?('▸ '+p.freyrRelevance):''].filter(Boolean).join('\n'))}</p></div>`).join('')}</div>`
  }

  const CSS = STYLE_BLOCK
  const overlay = (prefix:string) => `<div class="org-overlay" id="${prefix}-overlay"><button class="org-overlay-close" id="${prefix}-overlay-close">×</button><div class="org-overlay-scroll" id="${prefix}-overlay-scroll"><img class="org-overlay-img" id="${prefix}-overlay-img" src="${duImage}" alt="" /></div><div class="org-zoom-bar"><button class="org-zoom-btn" id="${prefix}-zoom-out">−</button><span class="org-zoom-pct" id="${prefix}-zoom-pct">100%</span><button class="org-zoom-btn" id="${prefix}-zoom-in">+</button><button class="org-zoom-btn" id="${prefix}-zoom-reset" title="Reset">⤢</button></div></div>`

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Executive Briefing — ${esc(accountName)}</title><style>${CSS}</style></head>
<body class="">
<div class="page">
  <div class="page-header">
    <div>
      <div style="display:flex;align-items:center;gap:0.5rem;"><span class="account-name">${esc(accountName)}</span><span class="badge">Executive Briefing</span></div>
      <div class="page-date">Generated on ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>
    </div>
    <div class="header-actions">
      <button class="theme-btn" id="fs-toggle" title="Toggle full screen"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span id="fs-label">Full screen</span></button>
      <button class="theme-btn" id="theme-toggle" title="Toggle theme"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" id="theme-icon-sun"><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" stroke-width="2"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="none" id="theme-icon-moon" style="display:none"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="currentColor" stroke-width="2"/></svg><span id="theme-label">Light</span></button>
      <button class="theme-btn" onclick="window.parent.postMessage('close-presentation','*')">← Back</button>
    </div>
  </div>
  <div class="content-wrapper">
    <nav class="nav-panel">
      ${[['s01','Actions from Last Review'],['s02','Pipeline & Revenue'],['s03','Big Bets'],['s04','Key Executive Relationships'],['s05','Competitive Intelligence'],['s06','Delivery & Customer Intelligence'],['s07','Immediate Next Steps'],['s08','Account Priorities']].map((n,i)=>`<button class="nav-item${i===0?' active':''}" data-target="${n[0]}"><span class="nav-num">0${i+1}</span><span class="nav-title">${esc(n[1])}</span></button>`).join('')}
    </nav>
    <div class="main-panel" id="main-panel"><div class="sections">
      <div class="section" id="s01"><div class="section-header"><span class="section-number">01</span><span class="section-title">Actions from Last Review</span></div>${s01()}</div>
      <div class="section" id="s02"><div class="section-header"><span class="section-number">02</span><span class="section-title">Pipeline &amp; Revenue</span></div>${s02()}</div>
      <div class="section" id="s03"><div class="section-header"><span class="section-number">03</span><span class="section-title">Big Bets</span></div>${s03()}</div>
      <div class="section" id="s04"><div class="section-header"><span class="section-number">04</span><span class="section-title">Key Executive Relationships</span></div>${s04()}</div>
      <div class="section" id="s05"><div class="section-header"><span class="section-number">05</span><span class="section-title">Competitive Intelligence</span></div>${s05()}</div>
      <div class="section" id="s06"><div class="section-header"><span class="section-number">06</span><span class="section-title">Delivery &amp; Customer Intelligence</span></div>${s06()}</div>
      <div class="section" id="s07"><div class="section-header"><span class="section-number">07</span><span class="section-title">Immediate Next Steps</span></div>${s07()}</div>
      <div class="section" id="s08"><div class="section-header"><span class="section-number">08</span><span class="section-title">Account Priorities</span></div>${s08()}</div>
    </div></div>
  </div>
</div>
${duImage ? overlay('dhu') : ''}
<script>${SCRIPT_BLOCK}</script>
</body></html>`
}


// ── Account Context View ──────────────────────────────────────────────────────
const AC_FIELDS = [
  { key:'organizationalOverview', label:'Organizational Overview in FY' },
  { key:'companyPerformance',     label:'Company Performance'           },
  { key:'keyPartners',            label:'Key Partners'                  },
  { key:'pipelineAndTherapyFocus',label:'Pipeline and Therapy Focus'    },
  { key:'accountInsights',        label:'Account Insights'              },
]

function AccountContextView({ planData, publishedData, onChange }: { planData:any; publishedData?:any; onChange:(d:any)=>void }) {
  // Seed: prefer publishedData (from DB), then planData seed, then empty
  const initContent = (key: string): string => {
    if (publishedData?.[key]?.content) return publishedData[key].content
    return planData?.accountContext?.[key]?.content || ''
  }

  const [fields, setFields] = useState<Record<string,string>>(() => {
    const init: Record<string,string> = {}
    AC_FIELDS.forEach(f => { init[f.key] = initContent(f.key) })
    return init
  })

  // Emit on mount so Save/Publish always has data
  useEffect(() => {
    const shaped: Record<string,any> = {}
    AC_FIELDS.forEach(f => { shaped[f.key] = { content: fields[f.key] } })
    onChange(shaped)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key: string, val: string) => {
    const next = { ...fields, [key]: val }
    setFields(next)
    const shaped: Record<string,any> = {}
    AC_FIELDS.forEach(f => { shaped[f.key] = { content: next[f.key] } })
    onChange(shaped)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:15, fontWeight:700, color:'var(--navy)', margin:0 }}>Account Context</h3>
      </div>

      {AC_FIELDS.map((f, i) => (
        <div key={f.key} style={{ marginBottom:22 }}>
          {/* Field label */}
          <div style={{ fontSize:16, fontWeight:700, color:'var(--text-2)', marginBottom:8, fontFamily:'Source Sans Pro,sans-serif' }}>
            {f.label}
          </div>
          {/* Textarea */}
          <textarea
            value={fields[f.key]}
            onChange={e => handleChange(f.key, e.target.value)}
            placeholder={f.label}
            rows={5}
            style={{
              width:'100%', padding:'14px 18px',
              borderRadius:8, border:'1px solid var(--border)',
              background:'var(--bg-surface)', color:'var(--text-1)',
              fontSize:16, fontFamily:'Source Sans Pro,sans-serif',
              lineHeight:1.75, resize:'vertical', outline:'none',
              transition:'border-color 180ms',
            }}
            onFocus={e => e.target.style.borderColor='var(--brand-2)'}
            onBlur={e  => e.target.style.borderColor='var(--border)'}
          />
        </div>
      ))}

      <p style={{ fontSize:15, color:'var(--text-3)', fontStyle:'italic', fontFamily:'Source Sans Pro,sans-serif', marginTop:4 }}>
        Edit any field above then click Save Draft or Publish — changes will reflect in Open Presentation and Download HTML.
      </p>
    </div>
  )
}

// ── Executive Briefing ────────────────────────────────────────────────────────
const EB_BTN: React.CSSProperties = {
  display:'flex', alignItems:'center', justifyContent:'center', gap:7,
  padding:'10px 20px', height:40, minWidth:180, borderRadius:8,
  fontSize:13.5, fontWeight:700, cursor:'pointer', fontFamily:'Source Sans Pro,sans-serif',
  boxSizing:'border-box', whiteSpace:'nowrap', lineHeight:1,
}
function ExecutiveBriefingView({ accountName, accountId, plan, sectionData }: { accountName:string; accountId:string; plan:any; sectionData:Record<string,any> }) {
  const [presenting, setPresenting] = useState(false)
  const [iframeSrc, setIframeSrc] = useState('')

  const buildHtml = () => buildPresentationHtml(accountName, accountId, plan, sectionData)

  // Open inline — generate blob URL and render in an iframe overlay
  const handleOpen = () => {
    const html = buildHtml()
    const blob = new Blob([html], { type:'text/html' })
    const url  = URL.createObjectURL(blob)
    setIframeSrc(url)
    setPresenting(true)
  }

  const handleClose = () => {
    setPresenting(false)
    if (iframeSrc) URL.revokeObjectURL(iframeSrc)
    setIframeSrc('')
  }

  // Download as HTML file
  const handleDownload = () => {
    const html = buildHtml()
    const blob = new Blob([html], { type:'text/html' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Account-Plan-${accountName.replace(/\s+/g,'-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* ── Fullscreen iframe overlay ── */}
      {presenting && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#f2f5fb', display:'flex', flexDirection:'column' }}>
          {/* Close bar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px', background:'#0f1e36', flexShrink:0, borderBottom:'1px solid rgba(212,175,55,0.2)' }}>
            <span style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.8)', fontFamily:'Source Sans Pro,sans-serif', letterSpacing:'-0.01em' }}>
              {accountName} — Account Plan
            </span>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleDownload} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px', borderRadius:8, background:'rgba(212,175,55,0.18)', border:'1px solid rgba(212,175,55,0.4)', color:'#e8c547', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'Source Sans Pro,sans-serif' }}>
                <Download size={14}/> Download HTML
              </button>
              <button onClick={handleClose} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 20px', borderRadius:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Source Sans Pro,sans-serif' }}>
                Close Presentation
              </button>
            </div>
          </div>
          <iframe
            src={iframeSrc}
            allow="fullscreen"
            allowFullScreen
            style={{ flex:1, border:'none', width:'100%' }}
            title="Account Plan Presentation"
            onLoad={e => {
              // Listen for postMessage from iframe "back" button so it closes the overlay
              const handler = (ev: MessageEvent) => { if (ev.data === 'close-presentation') handleClose() }
              window.addEventListener('message', handler)
              ;(e.target as any)._closeHandler = handler
            }}
          />
        </div>
      )}

      {/* ── Action bar (title omitted — account + section already shown in the selectors above) ── */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
          <div style={{ display:'flex', gap:10, alignItems:'stretch' }}>
            <button onClick={handleDownload}
              style={{ ...EB_BTN, background:'var(--gold)', border:'1px solid var(--gold)', color:'var(--navy)', boxShadow:'0 4px 14px rgba(212,175,55,0.4)' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--gold-bright)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--gold)'}>
              <Download size={14}/> Download HTML
            </button>
            <button onClick={handleOpen}
              style={{ ...EB_BTN, background:'var(--gold)', border:'1px solid var(--gold)', color:'var(--navy)', boxShadow:'0 4px 14px rgba(212,175,55,0.4)' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--gold-bright)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--gold)'}>
              Open Presentation <ArrowRight size={14}/>
            </button>
          </div>
      </div>
      {/* ── Inline scrollable briefing (exact HTML the Download button produces) ── */}
      <div style={{ marginTop:6 }}>
        <div style={{ border:'1.5px solid var(--brand-2)', borderRadius:'var(--radius-md)', overflow:'hidden', boxShadow:'var(--glow-card)', background:'#f2f5fb' }}>
          <iframe
            srcDoc={buildHtml()}
            title={`${accountName} Account Plan`}
            allow="fullscreen"
            allowFullScreen
            style={{ width:'100%', height:640, border:'none', display:'block' }}
          />
        </div>
      </div>
    </>
  )
}

// ── Business Health ───────────────────────────────────────────────────────────
const BH_NAVY_TH: React.CSSProperties = { background:'#1B365D', color:'#fff', padding:'9px 12px', textAlign:'left', fontSize:13, fontWeight:700, whiteSpace:'nowrap' }
function bhTextarea(v:string, set:(x:string)=>void, min=130): React.ReactNode {
  return <textarea value={v} onChange={e=>set(e.target.value)} style={{ width:'100%', minHeight:min, padding:'12px 14px', border:'1px solid var(--border)', borderRadius:8, background:'var(--bg-surface)', color:'var(--text-1)', fontSize:15, lineHeight:1.6, fontFamily:'inherit', resize:'vertical', outline:'none', boxSizing:'border-box' }}/>
}
// Parse a cell like '6.6', '5.19M', '—', '' → number or null (no data).
function bhNum(s?: string): number | null {
  if (!s) return null
  const t = s.trim()
  if (t === '' || t === '-' || t === '—') return null
  const n = parseFloat(t.replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? null : n
}
// Variance = Target − Actuals. '—' only when neither side has data.
function bhVariance(target?: string, actual?: string): string {
  const tn = bhNum(target), an = bhNum(actual)
  if (tn === null && an === null) return '—'
  const diff = (tn ?? 0) - (an ?? 0)
  const hasM = /M/i.test(actual || '') || /M/i.test(target || '')
  return `${diff.toFixed(2)}${hasM ? 'M' : ''}`
}

function ReadNumTable({ title, rows }: { title:string; rows:BookRow[] }) {
  const target = rows[0]
  const actual = rows[1]
  return (
    <div>
      <div style={{ fontSize:16, fontWeight:800, color:'#1B365D', marginBottom:8 }}>{title}</div>
      <div style={{ overflowX:'auto', border:'1px solid var(--border)', borderRadius:8 }}>
        <table style={{ borderCollapse:'collapse', width:'100%', fontSize:14 }}>
          <thead><tr>{['Amount (in $M)',"Q1'27","Q2'27","Q3'27","Q4'27",'Total'].map(h=><th key={h} style={BH_NAVY_TH}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r,ri)=>{
            const variance = /variance/i.test(r.label)
            const qVals = variance && target && actual ? target.q.map((tv,qi)=>bhVariance(tv, actual.q[qi])) : r.q
            const totalVal = variance && target && actual ? bhVariance(target.total, actual.total) : r.total
            return (
              <tr key={ri} style={{ borderTop:'1px solid var(--border)', background: variance ? '#f3f5f9' : '#fff' }}>
                <td style={{ padding:'9px 12px', color:'var(--text-2)', fontWeight:variance?600:500 }}>{r.label}</td>
                {qVals.map((v,qi)=><td key={qi} style={{ padding:'9px 12px', color:'var(--text-1)' }}>{v}</td>)}
                <td style={{ padding:'9px 12px', color:'var(--text-2)', fontWeight:700, background:'#eef1f6' }}>{totalVal}</td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )
}

function BusinessHealthView({ accountId, publishedData, onChange }: { accountId:string; publishedData?:any; onChange:(d:any)=>void }) {
  const account = ACCOUNTS_LIST.find(a=>a.id===accountId)
  const [d, setD] = useState<BusinessHealth>(() => publishedData || businessHealthFor(accountId) || businessHealthFor('astrazeneca'))
  useEffect(() => { onChange(d) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const emit = (n:BusinessHealth) => { setD(n); onChange(n) }

  const focusTotal = (() => {
    const num = (s:string)=>parseFloat(String(s).replace(/[^0-9.\-]/g,''))||0
    const b = d.focusThemes.reduce((a,t)=>a+num(t.booking),0)
    const r = d.focusThemes.reduce((a,t)=>a+num(t.revenue),0)
    return { b: b.toLocaleString(undefined,{maximumFractionDigits:2}), r: r.toLocaleString(undefined,{maximumFractionDigits:2}) }
  })()

  const OPP_COLS = ['Deal','Description','Competition','ACV','Est Closing','Status','Comments / Next Steps / Asks']
  const OPP_W = ['18%','14%','13%','8%','12%','14%','21%']
  const oppTA = (v:string, set:(x:string)=>void) => <textarea value={v} onChange={e=>set(e.target.value)} rows={2} style={{ width:'100%', minHeight:56, padding:'6px 8px', border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-surface)', color:'var(--text-1)', fontSize:14, fontFamily:'inherit', lineHeight:1.45, resize:'vertical', outline:'none', boxSizing:'border-box' }}/>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:26 }}>
      <div style={{ fontFamily:'Playfair Display,serif', fontSize:14, fontWeight:700, color:'#1B365D', paddingBottom:12, borderBottom:'1px solid var(--border)' }}>{account?.name} — Business Health</div>

      {/* Bookings + Revenues (read-only) */}
      <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <ReadNumTable title="Bookings" rows={d.bookings}/>
        <ReadNumTable title="Revenues" rows={d.revenues}/>
      </div>

      {/* Overall Forecast */}
      <div>
        <div style={{ fontSize:16, fontWeight:800, color:'#1B365D', marginBottom:8 }}>Overall Forecast</div>
        {bhTextarea(d.forecast, v=>emit({...d,forecast:v}), 220)}
      </div>

      {/* Focus Themes (read-only + total) */}
      <div>
        <div style={{ fontSize:16, fontWeight:800, color:'#1B365D', marginBottom:8 }}>Focus Themes — Deal Archetypes</div>
        <div style={{ border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
          <table style={{ borderCollapse:'collapse', width:'100%', fontSize:14 }}>
            <thead><tr>{["FY'27 Estimates",'Booking (in $k)',"Revenue Q1 FY '27 (in $k)"].map(h=><th key={h} style={BH_NAVY_TH}>{h}</th>)}</tr></thead>
            <tbody>
              {d.focusThemes.map((t,ti)=>(
                <tr key={ti} style={{ borderTop:'1px solid var(--border)', background:'#fff' }}>
                  <td style={{ padding:'9px 12px', color:'var(--text-2)' }}>{t.area}</td>
                  <td style={{ padding:'9px 12px', color:'var(--text-1)' }}>{t.booking}</td>
                  <td style={{ padding:'9px 12px', color:'var(--text-1)' }}>{t.revenue}</td>
                </tr>
              ))}
              <tr style={{ borderTop:'2px solid var(--border-strong)', background:'#eef1f6', fontWeight:700 }}>
                <td style={{ padding:'9px 12px', color:'#1B365D' }}>Total</td>
                <td style={{ padding:'9px 12px', color:'#1B365D' }}>{focusTotal.b}</td>
                <td style={{ padding:'9px 12px', color:'#1B365D' }}>{focusTotal.r}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Opportunities (editable) */}
      <div>
        <div style={{ fontSize:16, fontWeight:800, color:'#1B365D', marginBottom:12 }}>≥ 1 Mn Opportunities Mapped to Top Deals</div>
        {d.opportunities.length===0 && (
          <div style={{ border:'1px solid var(--border)', borderRadius:8, padding:'22px 12px', textAlign:'center', color:'var(--text-3)', fontSize:14 }}>No opportunities &gt; 1M found for this account.</div>
        )}
        {d.opportunities.map((g,gi)=>(
          <div key={gi} style={{ marginBottom:18 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--brand-2)', marginBottom:8 }}>{g.qtr}</div>
            <div style={{ overflowX:'auto', border:'1px solid var(--border)', borderRadius:8 }}>
              <table style={{ borderCollapse:'collapse', width:'100%', tableLayout:'fixed', fontSize:14, minWidth:820 }}>
                <colgroup>{OPP_W.map((w,i)=><col key={i} style={{ width:w }}/>)}</colgroup>
                <thead><tr>{OPP_COLS.map(h=><th key={h} style={{ ...BH_NAVY_TH, whiteSpace:'normal', fontSize:12.5 }}>{h}</th>)}</tr></thead>
                <tbody>{g.rows.map((r,ri)=>{
                  const st=(f:string,v:string)=>emit({...d,opportunities:d.opportunities.map((x,xi)=>xi!==gi?x:{...x,rows:x.rows.map((rr,rri)=>rri===ri?{...rr,[f]:v}:rr)})})
                  return <tr key={ri} style={{ borderTop:'1px solid var(--border)', verticalAlign:'top' }}>
                    <td style={{ padding:5 }}>{oppTA(r.deal,v=>st('deal',v))}</td>
                    <td style={{ padding:5 }}>{oppTA(r.description,v=>st('description',v))}</td>
                    <td style={{ padding:5 }}>{oppTA(r.competition,v=>st('competition',v))}</td>
                    <td style={{ padding:5 }}>{oppTA(r.acv,v=>st('acv',v))}</td>
                    <td style={{ padding:5 }}>{oppTA(r.estClosing,v=>st('estClosing',v))}</td>
                    <td style={{ padding:5 }}>{oppTA(r.status,v=>st('status',v))}</td>
                    <td style={{ padding:5 }}>{oppTA(r.comments,v=>st('comments',v))}</td>
                  </tr>
                })}</tbody>
              </table>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop:8 }} onClick={()=>emit({...d,opportunities:d.opportunities.map((x,xi)=>xi!==gi?x:{...x,rows:[...x.rows,{deal:'',description:'',competition:'',acv:'',estClosing:'',status:'',comments:''}]})})}><Plus size={13}/> Add row</button>
          </div>
        ))}
      </div>

      {/* Tailwinds / Headwinds */}
      <div>
        <div style={{ fontSize:16, fontWeight:800, color:'#1B365D', marginBottom:8 }}>Any Tailwinds, Headwinds / Challenges which need immediate attention</div>
        {bhTextarea(d.tailwinds||'', v=>emit({...d,tailwinds:v}), 150)}
      </div>

      {/* Commentary */}
      <div>
        <div style={{ fontSize:16, fontWeight:800, color:'#1B365D', marginBottom:8 }}>Commentary</div>
        {bhTextarea(d.commentary||'', v=>emit({...d,commentary:v}), 220)}
      </div>

      <p style={{ fontSize:14, color:'var(--text-3)', fontStyle:'italic' }}>Changes will be saved when you click Save Draft or Publish.</p>
    </div>
  )
}

// ── Delivery Health Update ────────────────────────────────────────────────────
function DeliveryHealthUpdateView({ accountId, publishedData, onChange }: { accountId:string; publishedData?:any; onChange:(d:any)=>void }) {
  const engs = engagementsForAccount(accountId)
  const remarks = engs.filter(e=>ragOf(e.rag_status)!=='green').slice(0,4).map(e=>{
    const rl = ragOf(e.rag_status)==='red'?'Critical':'Needs attention'
    return `Prioritize ${e.name} (${rl}). ${e.root_cause.slice(0,110)}…`
  })
  const [rows, setRows] = useState<DeliveryUpdateRow[]>(() => publishedData?.rows || deliveryUpdatesFor(accountId))
  const [image, setImage] = useState<string>(() => publishedData?.image || '')
  const [remarksText, setRemarksText] = useState<string>(() => publishedData?.remarks ?? remarks.join('\n'))
  const [zoom, setZoom] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  useEffect(() => { onChange({ rows, image, remarks:remarksText }) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const emit = (n:DeliveryUpdateRow[]) => { setRows(n); onChange({ rows:n, image, remarks:remarksText }) }
  const setImg = (img:string) => { setImage(img); onChange({ rows, image:img, remarks:remarksText }) }
  const setRemarks = (t:string) => { setRemarksText(t); onChange({ rows, image, remarks:t }) }
  const onFile = (f?:File) => { if(!f) return; const r=new FileReader(); r.onload=()=>setImg(String(r.result)); r.readAsDataURL(f) }
  const catColor: Record<string,string> = { ECS:'var(--navy)', EMS:'var(--navy)', CLINICAL:'var(--navy)', OTHERS:'var(--navy)' }
  const cellTA = (v:string, set:(x:string)=>void) => <textarea value={v} onChange={e=>set(e.target.value)} placeholder="Enter details…" style={{ width:'100%', minHeight:90, padding:'8px 10px', border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-surface)', color:'var(--text-1)', fontSize:14.5, fontFamily:'inherit', lineHeight:1.5, resize:'vertical', outline:'none', boxSizing:'border-box' }}/>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      {/* image upload (top) */}
      <div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>onFile(e.target.files?.[0])}/>
        {image ? (
          <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:12, background:'var(--bg-surface)' }}>
            <img src={image} alt="Delivery snapshot" onClick={()=>setZoom(1)} style={{ maxWidth:'100%', maxHeight:360, borderRadius:8, cursor:'zoom-in', display:'block', margin:'0 auto' }}/>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setZoom(1)}><Search size={13}/> Preview / Zoom</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>fileRef.current?.click()}><RefreshCw size={13}/> Replace image</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>setImg('')}><Trash2 size={13}/> Remove</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>fileRef.current?.click()} style={{ width:'100%', border:'1.5px dashed var(--border-strong)', borderRadius:10, padding:'32px', background:'var(--bg-raised)', cursor:'pointer', color:'var(--text-3)', display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <Upload size={24}/><span style={{ fontSize:14.5, fontWeight:600 }}>Upload delivery-health screenshot</span>
            <span style={{ fontSize:12.5 }}>PNG / JPG — appears at the top of the briefing Delivery section</span>
          </button>
        )}
      </div>

      {/* remarks — editable text field */}
      <div>
        <div style={{ fontSize:12, fontWeight:800, letterSpacing:'0.08em', color:'var(--text-3)', textTransform:'uppercase', marginBottom:8 }}>Remarks</div>
        <textarea value={remarksText} onChange={e=>setRemarks(e.target.value)} placeholder="Enter remarks…"
          style={{ width:'100%', minHeight:110, padding:'12px 14px', border:'1px solid var(--border)', borderRadius:8, background:'var(--bg-surface)', color:'var(--text-1)', fontSize:14.5, lineHeight:1.6, fontFamily:'inherit', resize:'vertical', outline:'none', boxSizing:'border-box' }}/>
      </div>

      {/* delivery updates — fixed layout, navy rail + blue category cells */}
      <div style={{ overflowX:'auto', border:'1px solid var(--border)', borderRadius:10 }}>
        <table style={{ borderCollapse:'collapse', width:'100%', tableLayout:'fixed', fontSize:14, minWidth:820 }}>
          <colgroup><col style={{ width:52 }}/><col style={{ width:96 }}/><col/><col/><col/></colgroup>
          <thead><tr>{['','CATEGORY','TOPIC','UPDATE ON PROGRESS','NEXT STEPS'].map((h,i)=><th key={i} style={{ background:'#1B365D', color:'#fff', padding:'10px 12px', textAlign:'left', fontSize:12, fontWeight:700, letterSpacing:'0.06em' }}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r,ri)=>{
            const set=(f:string,v:string)=>emit(rows.map((x,i)=>i===ri?{...x,[f]:v}:x))
            return <tr key={ri} style={{ borderTop:'1px solid var(--border)', verticalAlign:'top' }}>
              {ri===0 && <td rowSpan={rows.length} style={{ background:'#1B365D', color:'#fff', fontWeight:800, textAlign:'center', verticalAlign:'middle', letterSpacing:'0.1em', writingMode:'vertical-rl', transform:'rotate(180deg)', padding:'8px 4px', fontSize:13 }}>Delivery Updates</td>}
              <td style={{ padding:'12px 12px', fontWeight:800, color:catColor[r.category]||'var(--navy)', background:'var(--navy-faint)', borderRight:'1px solid var(--border)', verticalAlign:'middle' }}>{r.category}</td>
              <td style={{ padding:6 }}>{cellTA(r.topic,v=>set('topic',v))}</td>
              <td style={{ padding:6 }}>{cellTA(r.update,v=>set('update',v))}</td>
              <td style={{ padding:6 }}>{cellTA(r.next,v=>set('next',v))}</td>
            </tr>
          })}</tbody>
        </table>
      </div>
      <p style={{ fontSize:14, color:'var(--text-3)', fontStyle:'italic' }}>Changes will be saved when you click Save Draft or Publish.</p>

      {/* zoom preview */}
      {zoom>0 && image && (
        <div onClick={()=>setZoom(0)} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
          <img src={image} alt="" onClick={e=>e.stopPropagation()} style={{ transform:`scale(${zoom})`, maxWidth:'90vw', maxHeight:'82vh', objectFit:'contain', transition:'transform 120ms', cursor:'default' }}/>
          <button onClick={e=>{e.stopPropagation();setZoom(0)}} style={{ position:'fixed', top:20, right:24, width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.12)', color:'#fff', cursor:'pointer', fontSize:13 }}>×</button>
          <div onClick={e=>e.stopPropagation()} style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', display:'flex', gap:8, alignItems:'center', background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:24, padding:'6px 12px' }}>
            <button onClick={()=>setZoom(z=>Math.max(1,z-0.25))} style={zBtn}>−</button>
            <span style={{ color:'#fff', fontSize:13, minWidth:48, textAlign:'center' }}>{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.min(6,z+0.25))} style={zBtn}>+</button>
            <button onClick={()=>setZoom(1)} style={zBtn} title="Reset">⤢</button>
          </div>
        </div>
      )}
    </div>
  )
}
const zBtn: React.CSSProperties = { width:30, height:30, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.1)', color:'#fff', cursor:'pointer', fontSize:16 }

// ── Competition Update ────────────────────────────────────────────────────────
// Expandable cell: chevron grows height ONLY; width stays locked to the column so the
// table layout never breaks (fixes the "expand messes up layout" bug — resize is
// vertical-only, cells are width-constrained via table-layout:fixed + colgroup).
function CompCell({ value, onChange, placeholder, expanded, onToggle }:
  { value:string; onChange:(v:string)=>void; placeholder:string; expanded:boolean; onToggle:()=>void }) {
  return (
    <div style={{ position:'relative', width:'100%' }}>
      <textarea
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%', minWidth:0, maxWidth:'100%', boxSizing:'border-box',
          minHeight: expanded ? 220 : 64, height: expanded ? 220 : 64,
          padding:'8px 10px 22px', border:'1px solid var(--border)', borderRadius:6,
          background:'var(--bg-surface)', color:'var(--text-1)', fontSize:14.5,
          fontFamily:'inherit', lineHeight:1.5, resize:'vertical', outline:'none',
          transition:'height 140ms',
        }}
      />
      <button type="button" onClick={onToggle} title={expanded?'Collapse':'Expand'}
        style={{ position:'absolute', bottom:6, left:'50%', transform:'translateX(-50%)',
          width:26, height:16, display:'flex', alignItems:'center', justifyContent:'center',
          border:'none', background:'transparent', cursor:'pointer', color:'var(--text-3)' }}>
        <ChevronDown size={16} style={{ transform: expanded?'rotate(180deg)':'none', transition:'transform 140ms' }}/>
      </button>
    </div>
  )
}

function CompetitionUpdateView({ accountId, publishedData, onChange }: { accountId:string; publishedData?:any; onChange:(d:any)=>void }) {
  const [groups, setGroups] = useState<CompGroup[]>(() => publishedData?.groups || competitionUpdateFor(accountId))
  const [expanded, setExpanded] = useState<Record<string,boolean>>({})
  useEffect(() => { onChange({ groups }) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const emit = (n:CompGroup[]) => { setGroups(n); onChange({ groups:n }) }
  const toggle = (k:string) => setExpanded(p=>({ ...p, [k]:!p[k] }))
  const NAVY = '#1B365D'

  return (
    <div>
      <div className="section-heading glow" style={{ fontSize:16, marginBottom:18 }}>Competition Update</div>
      <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
        <table style={{ borderCollapse:'collapse', width:'100%', tableLayout:'fixed', fontSize:14 }}>
          <colgroup><col style={{ width:64 }}/><col style={{ width:'48%' }}/><col style={{ width:'48%' }}/></colgroup>
          <thead><tr style={{ background:NAVY }}>{['','COMPETITION','REMARKS'].map((h,i)=><th key={i} style={{ color:'#fff', padding:'10px 12px', textAlign:'left', fontSize:12, fontWeight:700, letterSpacing:'0.06em' }}>{h}</th>)}</tr></thead>
          <tbody>{groups.map((g,gi)=>(
            g.rows.map((r,ri)=>{
              const set=(f:string,v:string)=>emit(groups.map((x,xi)=>xi!==gi?x:{...x,rows:x.rows.map((rr,rri)=>rri===ri?{...rr,[f]:v}:rr)}))
              return <tr key={`${gi}-${ri}`} style={{ borderTop:'1px solid var(--border)', verticalAlign:'top' }}>
                {ri===0 && <td rowSpan={g.rows.length} style={{ background:NAVY, color:'#fff', fontWeight:800, textAlign:'center', padding:'8px 6px', verticalAlign:'middle', letterSpacing:'0.06em', fontSize:13 }}>{g.group}</td>}
                <td style={{ padding:'8px 10px', verticalAlign:'top' }}>
                  <div style={{ fontSize:11, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>Competition {ri+1}</div>
                  <CompCell value={r.competition} onChange={v=>set('competition',v)} placeholder="Enter details…" expanded={!!expanded[`${gi}-${ri}-c`]} onToggle={()=>toggle(`${gi}-${ri}-c`)}/>
                </td>
                <td style={{ padding:'8px 10px', verticalAlign:'top' }}>
                  <div style={{ fontSize:11, fontWeight:800, color:'transparent', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>—</div>
                  <CompCell value={r.remarks} onChange={v=>set('remarks',v)} placeholder="Enter remarks…" expanded={!!expanded[`${gi}-${ri}-r`]} onToggle={()=>toggle(`${gi}-${ri}-r`)}/>
                </td>
              </tr>
            })
          ))}</tbody>
        </table>
      </div>
      <p style={{ fontSize:14, color:'var(--text-3)', fontStyle:'italic', marginTop:12 }}>Changes will be saved when you click Save Draft or Publish.</p>
    </div>
  )
}

// ── Immediate Next Steps (P1/P2/P3) ───────────────────────────────────────────
function ImmediateNextStepsView({ accountId, publishedData, onChange }: { accountId:string; publishedData?:any; onChange:(d:any)=>void }) {
  const [steps, setSteps] = useState<NextStep[]>(() => (Array.isArray(publishedData?.steps) ? publishedData.steps : immediateStepsFor(accountId)))
  useEffect(() => { onChange({ steps }) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  const emit = (n:NextStep[]) => { setSteps(n); onChange({ steps:n }) }
  const set = (i:number, f:keyof NextStep, v:any) => emit(steps.map((s,idx)=>idx===i?{...s,[f]:v}:s))
  return (
    <div style={{ background:'#0f1e36', borderRadius:14, padding:'24px 26px', border:'1px solid rgba(212,175,55,0.25)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, color:'var(--gold-bright)', fontSize:14, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase' }}><ArrowRight size={16}/> Immediate Next Steps</div>
        <button onClick={()=>emit([...steps,{text:'New step',priority:'P2',owner:'No owner named',tags:[]}])} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background:'rgba(212,175,55,0.16)', border:'1px solid rgba(212,175,55,0.4)', color:'var(--gold-bright)', fontSize:13, fontWeight:600, cursor:'pointer' }}><Plus size={13}/> Add</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {steps.map((s,i)=>{
          const m = PRIORITY_META[s.priority]
          return (
            <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderLeft:`4px solid ${m.color}`, borderRadius:'0 10px 10px 0', padding:'14px 16px' }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:24, height:24, borderRadius:7, background:'rgba(255,255,255,0.08)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <textarea value={s.text} onChange={e=>set(i,'text',e.target.value)} rows={2}
                    style={{ width:'100%', background:'transparent', border:'none', outline:'none', resize:'vertical', color:'#fff', fontSize:15.5, lineHeight:1.5, fontFamily:'inherit' }}/>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, flexWrap:'wrap' }}>
                    <select value={s.priority} onChange={e=>set(i,'priority',e.target.value as Priority)}
                      style={{ background:m.bg, color:m.color, border:`1px solid ${m.color}`, borderRadius:6, fontSize:12, fontWeight:800, padding:'2px 6px', cursor:'pointer' }}>
                      <option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option>
                    </select>
                    <input value={s.owner} onChange={e=>set(i,'owner',e.target.value)}
                      style={{ background:'transparent', border:'none', outline:'none', color:'rgba(255,255,255,0.55)', fontSize:12.5, fontStyle:'italic', fontFamily:'inherit', width:150 }}/>
                    {s.tags.map((t,ti)=><span key={ti} style={{ fontSize:11, padding:'2px 8px', borderRadius:5, background:'rgba(212,175,55,0.15)', color:'var(--gold-bright)' }}>{t}</span>)}
                    <button onClick={()=>emit(steps.filter((_,x)=>x!==i))} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AccountPlanningPage() {
  const [selectedId, setSelectedId] = useState('astrazeneca')
  const [browseBy, setBrowseBy] = useState('Executive Briefing')

  // ── Persistent section data: keyed by section name, value = latest published data ──
  // This is the single source of truth for buildPresentationHtml.
  // It is populated on mount from DB/localStorage and updated on every Publish.
  const [publishedData, setPublishedData] = useState<Record<string,any>>({})

  // In-session edits (not yet saved). Reset when account changes.
  const [sectionData, setSectionData]   = useState<Record<string,any>>({})
  const [dbSections,  setDbSections]    = useState<any[]>([])  // raw PlanSection[] from DB
  const [loadingDB,   setLoadingDB]     = useState(true)
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null)

  const plan    = ACCOUNT_PLAN[selectedId]
  const account = ACCOUNTS_LIST.find(a=>a.id===selectedId)

  // ── Load all sections for this account from DB/localStorage on mount & account change ──
  useEffect(() => {
    setLoadingDB(true)
    setSectionData({})          // clear in-session edits when account changes
    getAllPlanSections(selectedId).then(sections => {
      setDbSections(sections)
      // Build publishedData map: latest published row per section key
      const pub: Record<string,any> = {}
      BROWSE_BY_OPTIONS.forEach(key => {
        if (key === 'Executive Briefing') return  // briefing has its own storage
        const latest = getLatestPublishedSection(sections, key)
        if (latest) pub[key] = latest.data
      })
      setPublishedData(pub)
      setLoadingDB(false)
    })
  }, [selectedId])

  // ── Version select: real versions come from dbSections (this section only) ──
  const [selectedVersion, setSelectedVersion] = useState('live')
  useEffect(() => { setSelectedVersion('live') }, [browseBy, selectedId])

  const sectionVersions = dbSections
    .filter(s => s.section_key === browseBy)
    .sort((a, b) => b.version_number - a.version_number)
  const hasDraftForSection = sectionVersions.some(s => s.is_draft)

  const showToast = (msg:string, type='success') => {
    setToast({msg,type}); setTimeout(()=>setToast(null), 2800)
  }

  // ── Get next version number for a section ──────────────────────────────────
  const getNextVersion = (sectionKey: string): number => {
    const published = dbSections.filter(s => s.section_key === sectionKey && !s.is_draft)
    return published.length > 0 ? Math.max(...published.map((s:any) => s.version_number)) + 1 : 1
  }

  // ── Save Draft: persist to DB as draft ────────────────────────────────────
  const handleSave = useCallback(async () => {
    const data = sectionData[browseBy]
    if (!data || browseBy === 'Executive Briefing') {
      showToast('Saved as Draft '); return
    }
    // Find existing draft for this section, or create new
    const existingDraft = getLatestDraftSection(dbSections, browseBy)
    const version = existingDraft?.version_number ?? getNextVersion(browseBy)
    const row = await savePlanSection({
      id: existingDraft?.id,
      account_id: selectedId,
      section_key: browseBy,
      version_number: version,
      data,
      saved_at: new Date().toISOString(),
      is_draft: true,
    })
    setDbSections(prev => {
      const idx = prev.findIndex(s => s.id === row.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = row; return n }
      return [row, ...prev]
    })
    showToast('Saved as Draft ')
  }, [browseBy, sectionData, selectedId, dbSections])

  // ── Publish: mark draft as published, update publishedData ────────────────
  const handlePublish = useCallback(async () => {
    const data = sectionData[browseBy] ?? publishedData[browseBy]
    if (!data || browseBy === 'Executive Briefing') {
      showToast('Published '); return
    }
    const existingDraft = getLatestDraftSection(dbSections, browseBy)
    const version = existingDraft?.version_number ?? getNextVersion(browseBy)
    const row = await savePlanSection({
      id: existingDraft?.id,
      account_id: selectedId,
      section_key: browseBy,
      version_number: version,
      data,
      saved_at: new Date().toISOString(),
      is_draft: false,  // ← mark as published
    })
    setDbSections(prev => {
      const idx = prev.findIndex(s => s.id === row.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = row; return n }
      return [row, ...prev]
    })
    // Update publishedData so next PPT generation picks it up immediately
    setPublishedData(prev => ({ ...prev, [browseBy]: data }))
    setSelectedVersion('live')
    showToast('Published — PPT will reflect this data')
  }, [browseBy, sectionData, publishedData, selectedId, dbSections])

  const handleChange = (d:any) => setSectionData(prev=>({...prev,[browseBy]:d}))

  // ── Version select: just switch which version is active — the view remounts (key
  // includes selectedVersion below) and re-seeds itself from currentSeed. ──────────
  const handleSelectVersion = (id: string) => setSelectedVersion(id)

  // 'live' = current session edit (falls back to last published); else the exact
  // data snapshot saved under that version. This is what feeds each section view.
  const currentSeed = selectedVersion === 'live'
    ? (sectionData[browseBy] ?? publishedData[browseBy])
    : sectionVersions.find(s => s.id === selectedVersion)?.data

  // ── Merged data for PPT: published DB data > static seed ──────────────────
  // This is what buildPresentationHtml receives. It merges:
  //   1. In-session edits (sectionData) — only available in current tab session
  //   2. Published DB data (publishedData) — persisted across sessions
  //   3. Static seed (ACCOUNT_PLAN) — fallback if nothing ever published
  const pptData: Record<string,any> = {}
  BROWSE_BY_OPTIONS.forEach(key => {
    pptData[key] = sectionData[key] ?? publishedData[key] ?? undefined
  })

  return (
    <div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:15, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', fontFamily:'Nunito,sans-serif' }}>BROWSE BY</span>
          <select className="select" value={browseBy} onChange={e=>setBrowseBy(e.target.value)} style={{ fontWeight:700, color:'var(--brand-2)', fontSize:16 }}>
            {BROWSE_BY_OPTIONS.map(opt=><option key={opt} value={opt}>{opt==='Account Context'?'Context':opt}</option>)}
          </select>
        </div>
        <button className="btn btn-ghost btn-icon btn-icon-sm" title="Refresh" onClick={()=>{ setLoadingDB(true); getAllPlanSections(selectedId).then(s=>{ setDbSections(s); const pub:Record<string,any>={}; BROWSE_BY_OPTIONS.forEach(k=>{ if(k==='Executive Briefing') return; const l=getLatestPublishedSection(s,k); if(l) pub[k]=l.data }); setPublishedData(pub); setLoadingDB(false) }) }}><RefreshCw size={14}/></button>
        <VersionToolbar versions={sectionVersions} selectedVersion={selectedVersion} onSelect={handleSelectVersion} hasDraft={hasDraftForSection} onSave={handleSave} onPublish={handlePublish}/>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {/* Company row */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 22px', borderBottom:'1px solid var(--border)', background:'var(--bg-raised)' }}>
          <div style={{ width:4, height:26, borderRadius:3, background:'var(--brand-2)', flexShrink:0 }}/>
          <select className="select" value={selectedId} onChange={e=>setSelectedId(e.target.value)} style={{ maxWidth:400 }}>
            {ACCOUNTS_LIST.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {/* Show which data source the current section's PPT will use */}
          {browseBy !== 'Executive Briefing' && (
            <span style={{ marginLeft:'auto', fontSize:15, color:'var(--text-3)', fontStyle:'italic' }}>
              PPT uses: {sectionData[browseBy] ? 'unsaved session edit' : publishedData[browseBy] ? 'published v' + (getLatestPublishedSection(dbSections, browseBy)?.version_number ?? '?') : 'static seed data'}
            </span>
          )}
        </div>

        {/* Content (section name already shown in BROWSE BY selector above — no duplicate title) */}
        <div style={{ padding:'20px 22px 28px' }}>
          {plan && browseBy==='Executive Briefing'        && <ExecutiveBriefingView key={selectedId} accountName={account?.name||''} accountId={selectedId} plan={plan} sectionData={pptData}/>}
          {plan && browseBy==='Account Context'            && <AccountContextView key={selectedId+'|'+selectedVersion} planData={plan} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Business Health'            && <BusinessHealthView key={selectedId+'|'+selectedVersion} accountId={selectedId} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Delivery Health Update'     && <DeliveryHealthUpdateView key={selectedId+'|'+selectedVersion} accountId={selectedId} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Competition Update'         && <CompetitionUpdateView key={selectedId+'|'+selectedVersion} accountId={selectedId} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Immediate Next Steps'       && <ImmediateNextStepsView key={selectedId+'|'+selectedVersion} accountId={selectedId} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Account Priority'          && <AccountPriorityView key={selectedId+'|'+selectedVersion} planData={plan} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Our Big Bets'              && <OurBigBetsView key={selectedId+'|'+selectedVersion} planData={plan} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Power Centres Responsible' && <PowerCentresView key={selectedId+'|'+selectedVersion} planData={plan} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Emerging Pipeline'         && <EmergingPipelineView key={selectedId+'|'+selectedVersion} planData={plan} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Inferences'                && <InferencesView key={selectedId+'|'+selectedVersion} accountId={selectedId} planData={plan} publishedData={currentSeed} onChange={handleChange}/>}
          {plan && browseBy==='Account Review Recap'      && <AccountReviewRecapView key={selectedId+'|'+selectedVersion} planData={plan} publishedData={currentSeed} onChange={handleChange}/>}
          {!plan && <div style={{ padding:'40px', textAlign:'center', color:'var(--text-3)' }}>Select an account to view.</div>}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type==='success'?'toast-success':'toast-error'}`}>{toast.msg}</div>}
    </div>
  )
}
