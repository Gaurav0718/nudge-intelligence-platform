import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import ModuleTabBar from '../../components/shared/ModuleTabBar'
import { SectionHeading, Card, Badge, MetricStat, AvatarInitials } from '../../components/shared/ui'
import ServiceLineSelector from '../../components/shared/ServiceLineSelector'
import DetailModal, { ModalSection } from '../../components/shared/DetailModal'
import { metricsForAccount, execsForAccount, execSource, type MarketExecutive } from '../../data/marketing.seed'
import { CORE_ACCOUNTS, accountById, serviceLineLabel } from '../../data/shared'
import { MARKETING_TABS } from './marketingTabs'

// Navy sequential ramp — single-hue, no colourful mixing.
const PIE_COLORS = ['#1B365D', '#244878', '#2e5a96', '#5a7499', '#8aa0be']

export default function AccountPulsePage() {
  const [params] = useSearchParams()
  const initial = params.get('account') && accountById(params.get('account')!) ? params.get('account')! : CORE_ACCOUNTS[0].id
  const [account, setAccount] = useState(initial)
  const [view, setView] = useState<'sov' | 'exec'>('sov')
  const [lens, setLens] = useState<string | null>(null)
  const [exec, setExec] = useState<MarketExecutive | null>(null)

  const acc = accountById(account)!
  const metrics = metricsForAccount(account)
  const execs = execsForAccount(account)
  const primary = (lens ? metrics.find(m => m.service_line === lens) : metrics[0]) ?? metrics[0]

  return (
    <div>
      <SectionHeading eyebrow="Marketing & Service Line" title="Account Pulse"
        sub="Per-account competitive presence — share of voice against the field, and the executive focus map for the buying committee." />
      <ModuleTabBar tabs={MARKETING_TABS} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {CORE_ACCOUNTS.map(a => (
          <button key={a.id} className={`pill-filter${account === a.id ? ' active' : ''}`} onClick={() => setAccount(a.id)}>{a.name}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        <button className={`pill-filter${view === 'sov' ? ' active' : ''}`} onClick={() => setView('sov')}>Share of Voice</button>
        <button className={`pill-filter${view === 'exec' ? ' active' : ''}`} onClick={() => setView('exec')}>Executive Focus</button>
      </div>

      {view === 'sov' && primary && (
        <>
          {metrics.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <ServiceLineSelector label="SERVICE LINE" allLabel={`Primary · ${serviceLineLabel(metrics[0].service_line)}`}
                options={metrics.map(m => ({ id: m.service_line, label: serviceLineLabel(m.service_line) }))}
                value={lens} onChange={setLens} />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
            <Card><MetricStat label="Share of voice" value={`${primary.share_of_voice_pct}%`} sub={`#${primary.visibility_position} visibility`} color="var(--navy)" /></Card>
            <Card><MetricStat label="Total mentions" value={primary.total_mentions} sub={primary.time_window} /></Card>
            <Card><MetricStat label="Competitors active" value={primary.competitors_active} /></Card>
            <Card><MetricStat label="Sources scanned" value={primary.sources_scanned.toLocaleString()} /></Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Share of voice — {serviceLineLabel(primary.service_line)}</div>
              <ResponsiveContainer width="100%" height={220}>
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: acc.name, value: primary.share_of_voice_pct, fill: 'var(--navy)' }]} startAngle={90} endAngle={90 - (primary.share_of_voice_pct / 100) * 360}>
                  <RadialBar background dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', fontSize: 30, fontWeight: 700, color: 'var(--navy)', marginTop: -140, pointerEvents: 'none' }}>{primary.share_of_voice_pct}%</div>
              <div style={{ height: 110 }} />
            </Card>
            <Card>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 14 }}>Activity type breakdown</div>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={primary.activity_type_breakdown} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={(e: any) => `${e.value}%`}>
                    {primary.activity_type_breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {view === 'exec' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {execs.length === 0 && <Card><div style={{ color: 'var(--text-3)', fontSize: 13.5 }}>No executive focus profiles seeded for {acc.name} in this module. See the Accounts hub for the full Exec Capital dossier.</div></Card>}
          {execs.map(e => (
            <Card key={e.id} clickable onClick={() => setExec(e)}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <AvatarInitials text={e.name} color={acc.accent_color} size={44} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)' }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{e.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{e.location}</div>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.55, marginBottom: 10 }}>{e.bio}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {e.focus_tags.map(t => <Badge key={t} color="navy">{t}</Badge>)}
              </div>
              {e.previous_companies.length > 0 && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 10 }}>Previously: {e.previous_companies.join(', ')}</div>}
            </Card>
          ))}
        </div>
      )}

      {exec && (
        <DetailModal eyebrow={`${exec.company} · Executive focus`} title={exec.name} onClose={() => setExec(null)}
          sourceLabel={execSource(exec).label} sourceUrl={execSource(exec).url}
          badges={<>
            <Badge color="navy">{exec.title}</Badge>
            <Badge color="gold">{exec.location}</Badge>
          </>}>
          <ModalSection label="Profile">{exec.bio}</ModalSection>
          <ModalSection label="Focus areas">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{exec.focus_tags.map(t => <Badge key={t} color="navy">{t}</Badge>)}</div>
          </ModalSection>
          {exec.previous_companies.length > 0 && <ModalSection label="Previously">{exec.previous_companies.join(', ')}</ModalSection>}
          <ModalSection label="Why this matters">
            {exec.name} sits in the {acc.name} buying committee. Align Company outreach to their focus areas ({exec.focus_tags.join(', ')}) and lead with proof points in those lanes.
          </ModalSection>
        </DetailModal>
      )}
    </div>
  )
}
