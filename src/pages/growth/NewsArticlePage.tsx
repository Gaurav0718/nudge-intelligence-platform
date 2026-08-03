import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { NEWS_INTERNAL, NEWS_EXTERNAL_ALL } from '../../data/growthIndex'
import { newsImageFor } from '../../data/newsImages'

const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'over', 'amid', 'ahead', 'after', 'its', 'new', 'plans', 'more', 'than', 'across', 'first', 'named', 'reports'])
const words = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP.has(w))
const sentences = (s: string) => (s || '').split(/\.\s+/).map(x => x.trim().replace(/\.$/, '')).filter(Boolean)

// Native <ul> markers are suppressed by Tailwind's preflight reset app-wide —
// use a manual bullet dot (matches the pattern used elsewhere in this app).
function Bullets({ text, fontSize = 15.5 }: { text: string; fontSize?: number }) {
  const items = sentences(text)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 8 }} />
          <span style={{ fontSize, color: 'var(--text-2)', lineHeight: 1.8 }}>{s}.</span>
        </div>
      ))}
    </div>
  )
}

export default function NewsArticlePage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isInternal = NEWS_INTERNAL.some(n => n.id === id)
  const feed = isInternal ? NEWS_INTERNAL : NEWS_EXTERNAL_ALL
  const article: any = [...NEWS_INTERNAL, ...NEWS_EXTERNAL_ALL].find(n => n.id === id) ?? NEWS_INTERNAL[0]
  const feedLabel = isInternal ? 'Internal News' : 'External News'
  const backTo = isInternal ? '/executive-summary' : '/executive-summary/external-news'

  // Curated snapshots related to THIS story only — scored by title/body word overlap, max 5.
  const key = new Set(words(`${article.title} ${article.body}`))
  const related = feed
    .filter((n: any) => n.id !== article.id)
    .map((n: any) => ({ n, score: words(`${n.title} ${n.body}`).reduce((s, w) => s + (key.has(w) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score || String(b.n.date).localeCompare(String(a.n.date)))
    .slice(0, 5)
    .map(x => x.n)

  return (
    <div>
      <button onClick={() => nav(backTo)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, color: 'var(--text-3)', marginBottom: 18, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={15} /> Back to {feedLabel}
      </button>

      <div className="news-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 22, alignItems: 'start' }}>
        {/* Main story */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <img src={newsImageFor(article)} alt="" loading="lazy" style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          <div style={{ padding: 28 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--brand)', textTransform: 'uppercase', marginBottom: 10 }}>{feedLabel} · {article.date}</p>
            <h1 style={{ fontSize: 27, fontWeight: 800, margin: '0 0 16px', fontFamily: 'Sora, sans-serif', color: 'var(--text-1)', lineHeight: 1.25 }}>{article.title}</h1>
            <div style={{ height: 2, width: 80, background: 'var(--gold)', marginBottom: 20, borderRadius: 2 }} />
            <Bullets text={article.body} />
          </div>
        </div>

        {/* Curated snapshots — navy, white text, images */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 12 }}>Related Snapshots</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {related.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No related stories.</div>}
            {related.map((n: any) => (
              <div key={n.id} onClick={() => nav(`/executive-summary/news/${n.id}`)}
                style={{ display: 'flex', gap: 12, cursor: 'pointer', background: 'var(--navy)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 18px rgba(27,54,93,0.18)' }}>
                <div style={{ width: 92, flexShrink: 0, background: 'var(--navy-mid)' }}>
                  <img src={newsImageFor(n)} alt="" loading="lazy" style={{ width: '100%', height: '100%', minHeight: 92, objectFit: 'cover', display: 'block', opacity: 0.9 }} onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, padding: '11px 12px 11px 0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-bright)', marginBottom: 4 }}>{n.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.title}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.45, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--gold-bright)', marginTop: 6 }}>Open <ArrowUpRight size={11} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
