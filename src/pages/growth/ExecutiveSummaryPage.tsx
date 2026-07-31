import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, AlertCircle, Users, GitBranch, DollarSign, ArrowRight } from 'lucide-react'
import { INSIGHT_CARDS, NEWS_INTERNAL, NEWS_EXTERNAL_ALL } from '../../data/growthIndex'
import { newsImageFor } from '../../data/newsImages'

const ICONS: Record<string, any> = { TrendingUp, AlertCircle, Users }

export default function ExecutiveSummaryPage({ section = 'internal' }: { section?: 'internal' | 'external' }) {
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const isExternal = section === 'external'
  const news = isExternal ? NEWS_EXTERNAL_ALL : NEWS_INTERNAL

  // brief skeleton when switching into the (larger) external feed
  useEffect(() => {
    if (isExternal) {
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 500)
      return () => clearTimeout(t)
    }
  }, [isExternal])

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4 }}>SALES & GROWTH</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}>
          {isExternal ? 'External News' : 'Internal News'}
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-3)', marginTop: 4 }}>
          {isExternal
            ? 'Account-level intelligence signals across the five priority accounts.'
            : 'Company company news, platform releases, and recognitions.'}
        </p>
      </div>

      {/* News — stacked list, one below the other, each with a topic image */}
      {loading ? (
        <div className="card" style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13.5, marginBottom: 20 }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {news.map(item => (
            <div key={item.id} className="card card-clickable" onClick={() => nav(`/executive-summary/news/${item.id}`)}
              style={{ display: 'flex', padding: 0, overflow: 'hidden', alignItems: 'stretch' }}>
              <div style={{ width: 230, flexShrink: 0, background: 'var(--bg-raised)' }}>
                <img src={newsImageFor(item)} alt="" loading="lazy"
                  style={{ width: '100%', height: '100%', minHeight: 152, objectFit: 'cover', display: 'block' }}
                  onError={e => { const t = e.currentTarget as HTMLImageElement; t.style.opacity = '0' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.date}</span>
                  {(item as any).featured && <span className="label" style={{ color: 'var(--gold-muted)' }}>Featured</span>}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.3, marginBottom: 8, fontFamily: 'Sora, sans-serif' }}>{item.title}</div>
                <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.body}</p>
                <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4 }}>Read full story <ArrowRight size={13} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight Cards + Pipeline/Financial CTAs — Internal News section only */}
      {!isExternal && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
            {INSIGHT_CARDS.map(card => {
              const Icon = ICONS[card.icon]
              return (
                <div key={card.id} className="card card-clickable" onClick={() => nav(card.path)}
                  style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      {Icon && <Icon size={18} />}
                    </div>
                    <span className="label" style={{ color: 'var(--text-3)' }}>{card.tag}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, flex: 1, margin: 0 }}>{card.preview}</p>
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.06em' }}>{card.readTime}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>Read More <ArrowRight size={12} /></span>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { tag: 'PIPELINE INSIGHTS', icon: GitBranch, text: 'Explore pipeline trends by Business Unit and Service Line, with drilldowns and filters.', cta: 'View full pipeline insights', path: '/executive-summary/pipeline-insights' },
              { tag: 'FINANCIAL INSIGHTS', icon: DollarSign, text: 'Track revenue signals, spend themes, and budget posture across key accounts and quarters.', cta: 'View financial insights', path: '/executive-summary/financial-insights' },
            ].map(card => {
              const Icon = card.icon
              return (
                <div key={card.tag} className="card card-clickable" style={{ padding: 20, display: 'flex', flexDirection: 'column' }} onClick={() => nav(card.path)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Icon size={18} />
                    </div>
                    <span className="label">{card.tag}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65, flex: 1, margin: '0 0 14px' }}>{card.text}</p>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4 }}>{card.cta} <ArrowRight size={13} /></div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
