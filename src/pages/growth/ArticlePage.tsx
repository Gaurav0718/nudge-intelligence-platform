import { useParams, useNavigate } from 'react-router-dom'

const sentences = (s: string) => (s || '').split(/\.\s+/).map(x => x.trim().replace(/\.$/, '')).filter(Boolean)

// Native <ul> markers are suppressed by Tailwind's preflight reset app-wide —
// use a manual bullet dot (matches the pattern used elsewhere in this app).
function Bullets({ text, items: itemsProp, fontSize = 20.5, dotColor = 'var(--brand)' }: { text?: string; items?: string[]; fontSize?: number; dotColor?: string }) {
  const items = itemsProp ?? sentences(text ?? '')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: fontSize / 2.6 }} />
          <span style={{ fontSize, color: 'var(--text-2)', lineHeight: 1.75 }}>{s}{/\.$/.test(s) ? '' : '.'}</span>
        </div>
      ))}
    </div>
  )
}

const ARTICLES: Record<string, any> = {
  'market-signals': {
    tag:'MARKET SIGNALS',
    signalPoints:[
      'Biopharma is converging on one goal: compress regulated knowledge-work cycle times.',
      'The lever is governed, scalable GenAI-driven automation across medical writing, MLR, and commercial content operations.',
      'The stakes: safeguarding launch-readiness and margin under intensifying pricing, portfolio, and supply-chain pressure.',
    ],
    sections:[
      { h:'1. Accelerated Regulatory and Launch Readiness Under Compressed Timelines', b:'Biopharma companies face a surge of late-stage clinical readouts and regulatory submission deadlines through 2025–2026, intensifying pressure on regulatory writing, submission planning, and launch content operations. Making cycle-time reduction and right-first-time quality critical to avoid revenue-impacting delays.', eg:"Daiichi Sankyo's focus on converting registrational trials into approvals faster; Vertex's pediatric CF submission factory for H1 2026.", impl:"Pharma service providers must offer GenAI-native medical writing and regulatory workflow orchestration with governance to compress drafting and review cycles." },
      { h:'2. Pricing and Market Access Volatility Driving Agile Commercial Execution', b:'Pricing reforms, biosimilar competition, and payer behavior are compressing net prices and increasing gross-to-net leakage. Companies report significant margin pressure and emphasize the need for rapid, compliant updates to market access materials.', eg:"Amgen's biosimilar pricing pressure; AbbVie's negative price expectations for Skyrizi.", impl:"Partners must deploy agentic forecasting workflows and omnichannel intelligence platforms that enable rapid scenario refresh and compliant content adaptation." },
      { h:'3. Enterprise-Grade GenAI Adoption with Life-Sciences-Specific Governance', b:'The industry is transitioning from AI pilots to industrial-scale, regulated GenAI deployments. Companies emphasize strict governance, auditability, and data privacy controls.', eg:"AstraZeneca's nationwide AI screening rollout; Boehringer Ingelheim's AI/LLM programs.", impl:"Service providers must embed enterprise-grade governance, human-in-the-loop controls, and interoperability." },
    ],
    keyPoints:['Accelerated adoption of AI and GenAI platforms across R&D, regulatory, commercial, and pharmacovigilance workflows.','Biopharma companies face intensified pricing pressures driving urgent needs for gross-to-net controls.','Manufacturing onshoring and capacity expansion are strategic imperatives to mitigate tariff and supply-chain risks.','Late-stage pipeline execution and launch readiness are increasingly time-bound and board-visible.','Enterprise transformation and operating-model redesigns are critical to unlock productivity.'],
  },
  'emerging-priorities': {
    tag:'EMERGING PRIORITIES',
    signalPoints:[
      'Leading pharmaceutical companies are converging on one priority: enterprise-wide execution acceleration through governed AI-enabled automation.',
      'The focus areas are compressed cycle times in regulatory submissions, compliant content supply chains, and omnichannel commercial operations.',
    ],
    sections:[
      { h:'1. Accelerate Regulatory and Launch Readiness to Mitigate Pipeline and Market Access Risks', b:'Multiple companies emphasize compressing regulatory submission and launch preparation cycles to protect time-sensitive milestones amid dense late-stage pipelines and heightened regulatory scrutiny.', eg:"Novartis and Daiichi Sankyo are investing in GenAI-native medical writing platforms to reduce cycle times by up to 63%.", impl:"Industry partners must offer scalable, compliant automation solutions that integrate with existing regulatory systems." },
      { h:'2. Defend Revenue and Margin Under Pricing Pressure and LOE', b:"Companies are confronting significant margin erosion from biosimilar competition, pricing reforms, and patent cliffs. AbbVie's Humira sales declined ~55% in Q3 2025.", eg:"Amgen, AbbVie, and J&J are accelerating uptake of newer growth brands to offset LOE losses.", impl:"Commercialization partners must deploy agentic forecasting workflows and omnichannel intelligence platforms." },
    ],
    keyPoints:['Accelerate regulatory throughput using AI-native platforms to meet compressed submission timelines.','Industrialize compliant content and localization workflows to reduce cycle times.','Establish governed, enterprise-scale AI adoption with strict data separation.','Enhance cross-functional execution cadence to manage complex M&A integration.','Scaled patient-access programs are critical to defend revenue at launch and during LOE transitions.'],
  },
  'executive-capital': {
    tag:'EXECUTIVE CAPITAL',
    signalPoints:[
      'Across leading pharmaceutical enterprises, executive authority is consolidating around a single mandate.',
      'That mandate: governance-grade AI and digital transformation.',
    ],
    sections:[
      { h:'1. Board-Level Visibility of AI and Digital Transformation', b:'Digital transformation and AI governance have become board-level agenda items. This elevation reflects both strategic importance and compliance risk.', eg:'AstraZeneca: Cristina Durán (President, Evinova) leads external technology partnerships (Accenture, AWS), signalling board-level comfort with production-scale AI. GSK: a stated 2026 priority to embrace AI and technology to drive agility.', impl:'Engagements must be framed in terms of board-visible metrics: cycle time, cost leverage, compliance posture.' },
      { h:'2. C-Suite Consolidation Around AI Governance Mandates', b:'C-suite executives are consolidating digital transformation authority. CFOs are increasingly involved in AI investment decisions.', eg:'AstraZeneca CEO Sir Pascal Soriot personally stewards the simultaneous $50B US / $15B China capital build-out, with CFO Aradhana Sarin modelling MFN pricing-policy impacts into guidance. GSK promoted Luke Miels (ex-CCO) to CEO in January 2026.', impl:'Long-term strategic partnerships are preferred over transactional vendor relationships.' },
    ],
    keyPoints:['AI governance has become a board-level agenda item. C-suite executives are consolidating digital transformation authority.','CFOs are increasingly involved in AI investment decisions and apply measurable ROI frameworks.','Chief Digital Officers and Chief Data Officers are gaining influence in vendor selection.','Long-term strategic partnerships are preferred over transactional vendor relationships.','A leadership-transition or capital-deployment window (e.g. GSK CEO transition, Jan 2026; AstraZeneca $15B China build-out) creates a 60-90 day opportunity for technology decisions.'],
  },
}

export default function ArticlePage() {
  const { type } = useParams()
  const nav = useNavigate()
  const article = type ? ARTICLES[type] : null
  if (!article) return <div style={{ padding:40,textAlign:'center',color:'var(--text-3)' }}>Article not found.</div>
  return (
    <div>
      <button onClick={() => nav('/executive-summary')} style={{ background:'none',border:'none',cursor:'pointer',fontSize:19,color:'var(--text-3)',marginBottom:20,fontFamily:'inherit',display:'flex',alignItems:'center',gap:5 }}>← Back to Executive Summary</button>
      <div className="card" style={{ padding:'20px 24px',marginBottom:20 }}>
        <div style={{ fontSize:13,fontWeight:700,color:'var(--text-3)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.08em' }}>Overarching Signal</div>
        <div style={{ display:'flex',gap:14,flexWrap:'wrap' }}>
          {article.signalPoints.map((s:string,i:number) => (
            <div key={i} style={{ flex:'1 1 280px',display:'flex',gap:10,alignItems:'flex-start',padding:'14px 16px',background:'var(--bg-hover)',borderRadius:10,borderLeft:'3px solid var(--brand)' }}>
              <span style={{ fontSize:15.5,color:'var(--text-1)',lineHeight:1.55,fontWeight:500 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="article-layout" style={{ display:'grid',gridTemplateColumns:'1fr 260px',gap:20,alignItems:'start' }}>
        <div className="card" style={{ padding:24 }}>
          <h2 style={{ fontSize:26,fontWeight:800,margin:'0 0 20px',color:'var(--text-1)',textAlign:'center',fontFamily:'Sora,sans-serif' }}>Detailed Insights</h2>
          {article.sections.map((s:any,i:number) => (
            <div key={i} style={{ marginBottom:28 }}>
              <h3 style={{ fontSize:22,fontWeight:700,color:'var(--text-1)',margin:'0 0 10px' }}>{s.h}</h3>
              <div style={{ marginBottom: 12 }}><Bullets text={s.b} /></div>
              {s.eg && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize:19.5,fontWeight:700,color:'var(--text-1)',marginBottom:6 }}>Examples</div>
                  <Bullets text={s.eg} fontSize={19.5} />
                </div>
              )}
              {s.impl && (
                <div>
                  <div style={{ fontSize:19.5,fontWeight:700,color:'var(--text-1)',marginBottom:6 }}>Strategic Implications</div>
                  <Bullets text={s.impl} fontSize={19.5} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ position:'sticky',top:80 }}>
          {article.keyPoints.map((pt:string,i:number) => (
            <div key={i} style={{ marginBottom:22 }}>
              <div style={{ fontSize:35,fontWeight:900,color:'var(--brand)',borderBottom:'2px solid var(--brand)',paddingBottom:4,marginBottom:8,display:'inline-block',minWidth:36,fontFamily:'Sora,sans-serif' }}>{String(i+1).padStart(2,'0')}</div>
              <p style={{ fontSize:19,color:'var(--text-2)',lineHeight:1.65,margin:0 }}>{pt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
