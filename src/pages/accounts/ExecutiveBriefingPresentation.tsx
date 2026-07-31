import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react'
import { accountById } from '../../data/shared'
import { dossierForAccount } from '../../data/accounts.seed'
import { crossModuleFor } from '../../lib/crossModule'
import { engagementsForAccount, type Engagement } from '../../data/delivery.seed'
import { RAG_META } from '../../components/shared/ui'
import { downloadHtml } from '../../lib/exportHtml'
import type { CrossModuleSignals } from '../../lib/crossModule'
import type { AccountDossier } from '../../data/accounts.seed'
import type { CoreAccount } from '../../data/shared'

export default function ExecutiveBriefingPresentation() {
  const { accountId } = useParams()
  const nav = useNavigate()
  const account = accountId ? accountById(accountId) : undefined
  const dossier = accountId ? dossierForAccount(accountId) : undefined
  const [slide, setSlide] = useState(0)

  if (!account) return <div style={{ padding: 40 }}>Account not found. <button onClick={() => nav('/accounts')}>Back</button></div>
  const x = crossModuleFor(account.id)
  const engs = engagementsForAccount(account.id)

  const slides = buildSlides(account, dossier, x, engs)
  const go = (d: number) => setSlide(s => Math.max(0, Math.min(slides.length - 1, s + d)))

  return (
    <div className="briefing-deck" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f1e36 0%, #152847 50%, #0f1e36 100%)', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: account.accent_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>{account.logo_letter}</div>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Executive Briefing</div>
            <div className="wordmark" style={{ fontSize: 17, fontWeight: 700 }}>{account.name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => downloadHtml(`${account.name}_Executive_Briefing`, buildPresentationHtml(account, slides))} style={btnStyle}><Download size={15} /> Export HTML</button>
          <button onClick={() => window.close()} style={btnStyle}><X size={15} /> Close</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 900, minHeight: 440, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 20, padding: '44px 52px', backdropFilter: 'blur(6px)' }}>
          {slides[slide].content}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '18px 28px 28px' }}>
        <button onClick={() => go(-1)} disabled={slide === 0} style={{ ...btnStyle, opacity: slide === 0 ? 0.4 : 1 }}><ChevronLeft size={16} /></button>
        <div style={{ display: 'flex', gap: 7 }}>
          {slides.map((_, i) => <span key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 22 : 8, height: 8, borderRadius: 4, background: i === slide ? 'var(--gold)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 200ms' }} />)}
        </div>
        <button onClick={() => go(1)} disabled={slide === slides.length - 1} style={{ ...btnStyle, opacity: slide === slides.length - 1 ? 0.4 : 1 }}><ChevronRight size={16} /></button>
        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>{slide + 1} / {slides.length}</span>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9,
  background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', color: 'var(--gold-bright, #e8c547)',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
}

interface Slide { title: string; content: React.ReactNode; html: string }

function buildSlides(account: CoreAccount, dossier: AccountDossier | undefined, x: CrossModuleSignals, _engs: Engagement[]): Slide[] {
  const H = (t: string) => <h2 className="briefing-deck" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 32, color: '#fff', marginBottom: 20 }}>{t}</h2>
  const slides: Slide[] = []

  slides.push({
    title: 'Cover',
    content: (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 13, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 16 }}>Company · The Company Intelligence</div>
        <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 52, color: '#fff', marginBottom: 14 }}>{account.name}</h1>
        <div style={{ fontSize: 18, color: 'var(--gold-bright, #e8c547)' }}>Executive Account Briefing</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 40 }}>{account.posture_label} · Prepared for Ritesh Dogra</div>
      </div>
    ),
    html: `<section class="cover"><div class="eyebrow">Company · The Company Intelligence</div><h1>${account.name}</h1><div class="sub">Executive Account Briefing</div><div class="meta">${account.posture_label}</div></section>`,
  })

  slides.push({
    title: 'One-Minute Summary',
    content: <div>{H('One-Minute Summary')}<p style={{ fontSize: 17, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>{dossier?.one_minute_summary ?? account.strategic_posture_text}</p></div>,
    html: `<section><h2>One-Minute Summary</h2><p>${dossier?.one_minute_summary ?? account.strategic_posture_text}</p></section>`,
  })

  const priorities = dossier?.emerging_priorities ?? []
  slides.push({
    title: 'Emerging Priorities',
    content: <div>{H('Emerging Priorities')}<ul style={{ fontSize: 16, lineHeight: 1.9, color: 'rgba(255,255,255,0.85)', paddingLeft: 22 }}>{priorities.map((p: string, i: number) => <li key={i} style={{ marginBottom: 8 }}>{p}</li>)}</ul></div>,
    html: `<section><h2>Emerging Priorities</h2><ul>${priorities.map((p: string) => `<li>${p}</li>`).join('')}</ul></section>`,
  })

  slides.push({
    title: 'Cross-Module Signals',
    content: (
      <div>{H('Cross-Module Signal Snapshot')}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 10 }}>
          <DeckStat label="Delivery Health" value={RAG_META[x.deliveryRag].label} sub={`${x.deliveryCounts.Critical} critical · ${x.deliveryCounts.NeedsAttention} watch`} color={RAG_META[x.deliveryRag].color} />
          <DeckStat label="Competition" value={`${x.openCompetitionSignals}`} sub="tracked signals" color="#e8c547" />
          <DeckStat label="Marketing SoV" value={x.shareOfVoice != null ? `${x.shareOfVoice}%` : '—'} sub="share of voice" color="#e8c547" />
        </div>
      </div>
    ),
    html: `<section><h2>Cross-Module Signal Snapshot</h2><div class="grid3"><div class="stat"><div class="v">${RAG_META[x.deliveryRag].label}</div><div class="l">Delivery Health</div></div><div class="stat"><div class="v">${x.openCompetitionSignals}</div><div class="l">Competition signals</div></div><div class="stat"><div class="v">${x.shareOfVoice ?? '—'}%</div><div class="l">Marketing SoV</div></div></div></section>`,
  })

  const bets = dossier?.big_bets ?? []
  if (bets.length) slides.push({
    title: 'Big Bets',
    content: <div>{H('Big Bets')}<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{bets.map((b, i) => <div key={i}><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-bright, #e8c547)', marginBottom: 4, fontFamily: '"Playfair Display", serif' }}>{b.title}</div><div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65 }}>{b.body}</div></div>)}</div></div>,
    html: `<section><h2>Big Bets</h2>${bets.map(b => `<div class="bet"><h3>${b.title}</h3><p>${b.body}</p></div>`).join('')}</section>`,
  })

  const nba = dossier?.next_best_actions ?? []
  slides.push({
    title: 'Next Best Actions',
    content: <div>{H('Next Best Actions')}<ol style={{ fontSize: 16.5, lineHeight: 1.9, color: 'rgba(255,255,255,0.85)', paddingLeft: 24 }}>{nba.map((n: string, i: number) => <li key={i} style={{ marginBottom: 10 }}>{n}</li>)}</ol></div>,
    html: `<section><h2>Next Best Actions</h2><ol>${nba.map((n: string) => `<li>${n}</li>`).join('')}</ol></section>`,
  })

  return slides
}

function DeckStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '20px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: '"Playfair Display", serif' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{sub}</div>
    </div>
  )
}

function buildPresentationHtml(account: CoreAccount, slides: Slide[]): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${account.name} — Executive Briefing</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
  body{margin:0;font-family:Inter,system-ui,sans-serif;background:linear-gradient(180deg,#0f1e36,#152847,#0f1e36);color:#fff}
  section{max-width:820px;margin:0 auto;padding:56px 48px;border-bottom:1px solid rgba(212,175,55,.2)}
  h1{font-family:"Playfair Display",serif;font-size:52px;margin:0 0 12px}
  h2{font-family:"Playfair Display",serif;font-size:34px;margin:0 0 20px;color:#fff}
  h3{font-family:"Playfair Display",serif;font-size:20px;color:#e8c547;margin:0 0 4px}
  p,li{font-size:16px;line-height:1.75;color:rgba(255,255,255,.85)}
  .cover{text-align:center;padding-top:100px}
  .eyebrow{letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.5);font-size:13px;margin-bottom:16px}
  .sub{color:#e8c547;font-size:20px}.meta{color:rgba(255,255,255,.5);margin-top:32px}
  .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  .stat{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;text-align:center}
  .stat .v{font-family:"Playfair Display",serif;font-size:30px;color:#e8c547}.stat .l{font-size:13px;margin-top:8px}
  .bet{margin-bottom:18px}
</style></head><body>
${slides.map(s => s.html).join('\n')}
<section style="text-align:center;color:rgba(255,255,255,.4);font-size:12px">© 2026 The Company Intelligence · Company Internal Platform</section>
</body></html>`
}
