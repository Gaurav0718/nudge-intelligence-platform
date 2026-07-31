// ─── Account Planning — 4 extra sections seed ─────────────────────────────────
// Business Health · Delivery Health Update · Competition Update · Immediate Next Steps.
// Editable in the UI; this is the per-account seed. Priorities use P1/P2/P3.

export type Priority = 'P1' | 'P2' | 'P3'  // P1=urgent, P2=this week, P3=this month

export interface NextStep { text: string; priority: Priority; owner: string; tags: string[] }
export interface BookRow { label: string; q: [string, string, string, string]; total: string }
export interface FocusTheme { area: string; booking: string; revenue: string }
export interface OppRow { deal: string; description: string; competition: string; acv: string; estClosing: string; status: string; comments: string }
export interface OppGroup { qtr: string; rows: OppRow[] }
export interface BusinessHealth {
  bookings: BookRow[]
  revenues: BookRow[]
  forecast: string
  focusThemes: FocusTheme[]
  opportunities: OppGroup[]
  tailwinds: string
  commentary: string
}
export interface CompGroup { group: string; rows: { competition: string; remarks: string }[] }
export interface DeliveryUpdateRow { category: string; topic: string; update: string; next: string }

const blankComp = (n = 4) => Array.from({ length: n }, () => ({ competition: '', remarks: '' }))

// ── BUSINESS HEALTH ──────────────────────────────────────────────────────────
// Focus Themes = 7 fixed archetype rows for every account. Empty string = blank cell;
// literal '-' or '—' are stored where the source shows a dash.
const FT_ROWS = ['Agentic AOR / AOR', 'D&A + Tech', 'Medcomm, MLR', 'OA + Biopharma', 'Others', 'Regulatory Writing / R&D', 'Tectonic / ECO']
const ft = (pairs: [string, string][]): FocusTheme[] => FT_ROWS.map((area, i) => ({ area, booking: pairs[i]?.[0] ?? '', revenue: pairs[i]?.[1] ?? '' }))

export const BUSINESS_HEALTH: Record<string, BusinessHealth> = {
  astrazeneca: {
    bookings: [
      { label: 'Target (including renewals)', q: ['2.6', '2.4', '2.8', '2.1'], total: '9.9' },
      { label: 'Actuals / Latest Estimates', q: ['2.3', '2.0', '—', '—'], total: '4.3' },
      { label: 'Variance', q: ['0.30', '0.40', '2.80', '2.10'], total: '5.60' },
    ],
    revenues: [
      { label: 'Target', q: ['2.2', '2.3', '2.5', '2.6'], total: '9.6' },
      { label: 'Actuals / Latest Estimates', q: ['2.05', '2.10', '—', '—'], total: '4.15' },
      { label: 'Variance', q: ['0.15', '0.20', '2.50', '2.60'], total: '5.45' },
    ],
    forecast: 'New business ($3.16M) + Growth ($0.45M) + Renewals ($1.57M) = $5.19M\n\nVariance in Bookings and Revenue for Q1 - Due to delay in signing T1.5 contract for Canada and UK and France ($6M)  2) MLR contract on hold due to delivery issues ($2M).\nOur next Quarter pipeline looks strong. \nListed below is pipeline for next Quarter:\n- Pursuing proactive opportunity in Digital Affinity and brand activation space in AZ with Stakeholder - Sonny  Shergill (Potential opportunity of $1M)\n- Agent AOR Opportunity. - 1st presentation to GCO on July 20th\n- Future of CRM - Company to initiate discussion with Harsh Gandhi\n-Claims library Scaling Support(Oncology) ($250K)\n- Tectonic - Canada and UK contract will be signed in Q2(August)\n- Submitted AZ_RFP_Design & Transformation of the GMAL and ESET Consulting RFP through scientist.com - Awaiting client response(Kate Lowe) -  we have strong chances to win this RFP ($3.52M).\n- Expecting more business opportunities in Medical space as Company is selected as preferred partner in MedCom, MedEd and Medinfo\n- ALX  RFI Medical  Content Company Response -  Submitted Awaiting response\n- Alexion- Clinical which has been white space we have received 2 RFP from Alexion 1)Study Specific RFP(ALXN2520-HCM-201) 2) Patient Identification, Referral &  Genetic Testing.',
    focusThemes: ft([
      ['-', '-'],
      ['-', '698.65'],
      ['1641.87', '2,655.49'],
      ['-', '32.07'],
      ['323.59', '296.88'],
      ['-', '0.0'],
      ['2648.74', '6,405.08'],
    ]),
    opportunities: [
      { qtr: 'Qtr ending Sep 30, 2026', rows: [
        { deal: 'AZ_Global_GCO Tier 1.5_Canada_Delivery (FTE & Rate Card)', description: '', competition: 'Proactive pitch as part of T1.5', acv: '2M', estClosing: '2026-07-15', status: 'Contract will be signed in August', comments: 'Contract will be signed in August' },
        { deal: 'AZ_Global_GCO Tier 1.5_US BBU_Delivery (FTE & Rate Card)', description: '', competition: 'Proactive Pitch', acv: '3M', estClosing: '2026-07-30', status: 'On hold', comments: '' },
        { deal: 'AZ_ 2026/2027 Medical Communication RFI', description: '', competition: 'Yes - Multiple Vendors', acv: '1M', estClosing: '2026-07-31', status: 'Received contract Amendment', comments: 'Contract under review from Company side.' },
        { deal: 'AZ_Digital Affinity', description: '', competition: 'Proactive Pitch', acv: '1M', estClosing: '2026-09-30', status: 'In progress', comments: 'Presentation with Stakeholder scheduled on 16th July' },
      ] },
      { qtr: 'Qtr ending Dec 31, 2026', rows: [
        { deal: 'AZ_Global_GCO Tier 1.5_US OBU_Delivery (FTE & Rate Card) ON HOLD', description: '', competition: 'Proactive pitch', acv: '1M', estClosing: '2026-10-28', status: 'On Hold', comments: '' },
        { deal: 'AZ_Global_Pharma 2.0', description: '', competition: '', acv: '10M', estClosing: '2026-11-13', status: '', comments: '' },
        { deal: 'AZ_MLR Tech for Global, US and EUCAN', description: '', competition: 'Proactive Pitch', acv: '1M', estClosing: '2026-11-18', status: 'On hold', comments: 'Due to MLR implementation issues the engagement is hold' },
        { deal: 'AZ_FY27_Renewal_Global_TS_BBU Training OSP', description: '', competition: '', acv: '1.19M', estClosing: '2026-11-25', status: '', comments: '' },
        { deal: 'AZ_Global_GCS_LATAM Insourcing', description: '', competition: '', acv: '5M', estClosing: '2026-12-30', status: '', comments: '' },
        { deal: 'AZ_FY27_Renewal_OBU_Lung Team', description: '', competition: '', acv: '1.16M', estClosing: '2026-12-31', status: '', comments: '' },
      ] },
    ],
    tailwinds: '1) Insourcing -  Shift towards internal teams limiting outsourcing opportunities, Impact : Potential 5-10% Revenue growth slowdown, Mitigation -\ni) High value  niche capabilities\nii) Adopt hybrid delivery and co creation models.\n2) Rebates - Increased rebate expectations and pricing concessions, Impact: i) 1-3% compression at account level ii) Increased pricing pressure during renewals  Mitigation: Link rebate to volume growth  tenure or expanded growth.\n3)T Preferred Vendor - AstraZeneca IT leadership have decided to award IT engagements to preferred vendor who have been working with AZ in IT space for very long time.\nImpact: impact on pursuing IT business opportunities. Help from Leadership to connect with IT Officer and IT head of AZ',
    commentary: 'Highlights\n- Received first IT engagement in Data & Analytics ($1M) in AZ.  Delivery is in progress and will complete by  end of July.\n- T1.5 Germany and Spain market contract got signed\n- Company was invited to participate in Multiple RFP in Medical space.\n- Scientist.com (specific to Medica) New Business (5 Opportunities) + Renewal Business  = $2.32M\n\nNew Relationship:\nAnna Cesarz - Alexion -Associate Director Procurement for R&D (Aradhana Sarin)\nBenny Farsaci - AstraZeneca Global Safety Head (Susan Galbraith - EVP Oncology R&D AstraZeneca)\nErica Deacon - Head of IT Alexion\n\nLow Lights :\n- Escalations in AZ & Alexion in Medical.\n- Delay in closure of large deals in T1.5\n- MLR engagement on hold for AZ and ALX\n\nLost RFP:\n- AZ Medical Communications Support opportunity in Nephrology/IgAN',
  },

  gsk: {
    bookings: [
      { label: 'Target (including renewals)', q: ['2.0', '1.8', '2.5', '2.2'], total: '8.5' },
      { label: 'Actuals / Latest Estimates', q: ['1.7', '1.6', '—', '—'], total: '3.3' },
      { label: 'Variance', q: ['0.30', '0.20', '2.50', '2.20'], total: '5.20' },
    ],
    revenues: [
      { label: 'Target', q: ['1.9', '2.0', '2.1', '2.0'], total: '8.0' },
      { label: 'Actuals / Latest Estimates', q: ['1.75', '1.85', '—', '—'], total: '3.60' },
      { label: 'Variance', q: ['0.15', '0.15', '2.10', '2.00'], total: '4.40' },
    ],
    forecast: '',
    focusThemes: ft([
      ['', ''],
      ['505.76', '2,095.25'],
      ['158.39', ''],
      ['', '47.77'],
      ['158.80', '254.52'],
      ['910.77', '84.70'],
      ['', '453.42'],
    ]),
    opportunities: [],
    tailwinds: '',
    commentary: '',
  },

  jnj: {
    bookings: [
      { label: 'Target (including renewals)', q: ['1.8', '2.4', '2.6', '2.9'], total: '9.7' },
      { label: 'Actuals / Latest Estimates', q: ['1.6', '2.1', '—', '—'], total: '3.7' },
      { label: 'Variance', q: ['0.20', '0.30', '2.60', '2.90'], total: '6.00' },
    ],
    revenues: [
      { label: 'Target', q: ['2.0', '2.2', '2.3', '2.4'], total: '8.9' },
      { label: 'Actuals / Latest Estimates', q: ['1.85', '2.05', '—', '—'], total: '3.90' },
      { label: 'Variance', q: ['0.15', '0.15', '2.30', '2.40'], total: '5.00' },
    ],
    forecast: '',
    focusThemes: ft([
      ['-', '18.21'],
      ['-', '472.15'],
      ['600.00', '68.65'],
      ['-', '463.73'],
      ['28.00', '139.84'],
      ['-', '630.90'],
      ['250.00', '1,171.08'],
    ]),
    opportunities: [
      { qtr: 'Qtr ending Sep 30, 2026', rows: [
        { deal: '2026_JJIM_US_Medcomm_GenAI_RFI', description: '', competition: '', acv: '1M', estClosing: '2026-07-31', status: '', comments: '' },
        { deal: '2025_JJIM_NA_MedComm MCET', description: '', competition: '', acv: '1M', estClosing: '2026-08-21', status: '', comments: '' },
      ] },
      { qtr: 'Qtr ending Dec 31, 2026', rows: [
        { deal: '2025_JJIM_EMEA_Tectonic', description: '', competition: '', acv: '1M', estClosing: '2026-10-31', status: '', comments: '' },
        { deal: '2027_JJIM EMEA_Future Operating Model_ Track 3 Rollout + change mgmt', description: '', competition: '', acv: '1.5M', estClosing: '2026-12-15', status: '', comments: '' },
      ] },
    ],
    tailwinds: '',
    commentary: '',
  },

  novartis: {
    bookings: [
      { label: 'Target (including renewals)', q: ['2.3', '2.1', '2.6', '2.4'], total: '9.4' },
      { label: 'Actuals / Latest Estimates', q: ['2.0', '1.9', '—', '—'], total: '3.9' },
      { label: 'Variance', q: ['0.30', '0.20', '2.60', '2.40'], total: '5.50' },
    ],
    revenues: [
      { label: 'Target', q: ['2.0', '2.1', '2.2', '2.3'], total: '8.6' },
      { label: 'Actuals / Latest Estimates', q: ['1.85', '1.95', '—', '—'], total: '3.80' },
      { label: 'Variance', q: ['0.15', '0.15', '2.20', '2.30'], total: '4.80' },
    ],
    forecast: 'abc',
    focusThemes: ft([
      ['', '-'],
      ['', '648.86'],
      ['', '116.08'],
      ['', '625.90'],
      ['380.00', '449.03'],
      ['', '66.67'],
      ['1500.00', '5.64'],
    ]),
    opportunities: [
      { qtr: 'Qtr ending Sep 30, 2026', rows: [
        { deal: 'Novartis_Global_Global Medical Affairs Sourcing RFP', description: '', competition: '', acv: '4.5M', estClosing: '2026-07-31', status: '', comments: '' },
        { deal: 'Digital Engagement Hub', description: '', competition: '', acv: '10M', estClosing: '2026-07-31', status: '', comments: '' },
        { deal: "Novartis_GBS_US Market Analytics RFP Q3 '26 SOWs", description: '', competition: '', acv: '1.5M', estClosing: '2026-09-18', status: '', comments: '' },
        { deal: 'Novartis_INTL_Content Production (RFP)', description: '', competition: '', acv: '2M', estClosing: '2026-09-25', status: '', comments: '' },
      ] },
      { qtr: 'Qtr ending Dec 31, 2026', rows: [
        { deal: 'Novartis_US_End to End Video Production (RFP)', description: '', competition: '', acv: '1M', estClosing: '2026-10-01', status: '', comments: '' },
        { deal: 'Novartis_FY27_Renewal_US_Demand Renewal', description: '', competition: '', acv: '1.42M', estClosing: '2026-12-31', status: '', comments: '' },
      ] },
    ],
    tailwinds: '',
    commentary: '',
  },

  sanofi: {
    bookings: [
      { label: 'Target (including renewals)', q: ['1.7', '1.9', '2.6', '2.5'], total: '8.7' },
      { label: 'Actuals / Latest Estimates', q: ['1.5', '1.7', '—', '—'], total: '3.2' },
      { label: 'Variance', q: ['0.20', '0.20', '2.60', '2.50'], total: '5.50' },
    ],
    revenues: [
      { label: 'Target', q: ['1.8', '1.9', '2.1', '2.2'], total: '8.0' },
      { label: 'Actuals / Latest Estimates', q: ['1.65', '1.75', '—', '—'], total: '3.40' },
      { label: 'Variance', q: ['0.15', '0.15', '2.10', '2.20'], total: '4.60' },
    ],
    forecast: '',
    focusThemes: ft([
      ['', '-'],
      ['', '-'],
      ['', '-'],
      ['', '205.68'],
      ['102.35', '1,082.67'],
      ['', '-'],
      ['', '126.36'],
    ]),
    opportunities: [
      { qtr: 'Qtr ending Sep 30, 2026', rows: [
        { deal: 'Patient Support Program KSA', description: '', competition: '', acv: '1.5M', estClosing: '2026-07-20', status: '', comments: '' },
      ] },
      { qtr: 'Qtr ending Dec 31, 2026', rows: [
        { deal: 'End to end content transformation', description: '', competition: '', acv: '1.2M', estClosing: '2026-10-30', status: '', comments: '' },
        { deal: 'Lat AM PSP', description: '', competition: '', acv: '3M', estClosing: '2026-11-10', status: '', comments: '' },
        { deal: 'Sanofi hubs', description: '', competition: '', acv: '10M', estClosing: '2026-12-31', status: '', comments: '' },
        { deal: 'Content Ops - Tech', description: '', competition: '', acv: '1.5M', estClosing: '2026-12-31', status: '', comments: '' },
        { deal: 'Content Operations Hybrid model', description: '', competition: '', acv: '2M', estClosing: '2026-12-31', status: '', comments: '' },
      ] },
    ],
    tailwinds: '',
    commentary: '',
  },
}

// ── COMPETITION UPDATE ───────────────────────────────────────────────────────
export const COMPETITION_UPDATE: Record<string, CompGroup[]> = {
  astrazeneca: [
    { group: 'ECS', rows: [
      { competition: 'EY, Deliotte, Slalom, TCS, Cognizant', remarks: 'Majority of IT work in IT space is done by following vendor\nEY, Delliotte, TCS is working on strategic program  Future CRM' },
      ...blankComp(3),
    ] },
    { group: 'EMS', rows: [
      { competition: 'Syneos Health, IQVIA', remarks: 'Our competition in MedComm and Medaffair space is Syneos Health, IQVIA' },
      ...blankComp(3),
    ] },
    { group: 'CLINICAL', rows: [
      { competition: 'IQVIA', remarks: 'Majority of portion in Clinical, Safety and Publication is managed by IQVIA' },
      ...blankComp(3),
    ] },
    { group: 'OTHERS', rows: blankComp(4) },
  ],
}
function baseComp(): CompGroup[] {
  return [
    { group: 'ECS', rows: blankComp(4) },
    { group: 'EMS', rows: blankComp(4) },
    { group: 'CLINICAL', rows: blankComp(4) },
    { group: 'OTHERS', rows: blankComp(4) },
  ]
}
COMPETITION_UPDATE.gsk = baseComp()
COMPETITION_UPDATE.jnj = baseComp()
COMPETITION_UPDATE.novartis = baseComp()
COMPETITION_UPDATE.sanofi = baseComp()

// ── DELIVERY UPDATES (editable table; snapshot + remarks are derived live) ─────
export const DELIVERY_UPDATES: Record<string, DeliveryUpdateRow[]> = {
  astrazeneca: [
    { category: 'ECS', topic: '', update: '', next: '' },
    { category: 'EMS', topic: '-Escalation, Staffing gaps + Key risks and mitigation\n-Escalation on core skills(word, powerpoint) + Gaps in understanding scientific requirements (Graphic designer)', update: 'Action items ongoing – Company will work on them as part of ongoing future state  (training, recruitment process,  upskilling of resources).\n2) Required corrective actions have been take to train resources\n3)MLR Production implementation issues', next: '1)Future meetings with Artee Mithal in July/Sept\n2) Meeting with Kate Long and required action has been taken' },
    { category: 'CLINICAL', topic: '', update: '', next: '' },
    { category: 'OTHERS', topic: '', update: '', next: '' },
  ],
}
const baseDU = (): DeliveryUpdateRow[] => ['ECS', 'EMS', 'CLINICAL', 'OTHERS'].map(c => ({ category: c, topic: '', update: '', next: '' }))
DELIVERY_UPDATES.gsk = baseDU()
DELIVERY_UPDATES.jnj = baseDU()
DELIVERY_UPDATES.novartis = baseDU()
DELIVERY_UPDATES.sanofi = baseDU()

// ── IMMEDIATE NEXT STEPS (authored analysis, P1/P2/P3) ───────────────────────
export const IMMEDIATE_STEPS: Record<string, NextStep[]> = {
  astrazeneca: [
    { text: 'Finalize the Germany/Italy localization vendor confirmation for the Imfinzi GEJ launch — the single blocker flagged in both delivery and the launch calendar.', priority: 'P1', owner: 'Devika Rao', tags: ['Delivery & Customer Intelligence', 'Actions from Last Review'] },
    { text: 'Close the China NMPA capacity gap — reassign 2 EU regulatory specialists now while the permanent 3-FTE requisition is filled.', priority: 'P1', owner: 'No owner named', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Progress the AZ_RFP Design & Transformation of GMAL ($3.52M) — follow up with Kate Lowe for client response after 27 July.', priority: 'P2', owner: 'No owner named', tags: ['Big Bets', 'Actions from Last Review'] },
    { text: 'Present the Digital Affinity brand-activation opportunity (~$1M) to Sonny Shergill — stakeholder session scheduled 16 July.', priority: 'P2', owner: 'Ritesh Dogra', tags: ['Key Executive Relationships'] },
    { text: 'Initiate the Future-of-CRM discussion with Harsh Gandhi against EY/Deloitte/TCS incumbency in the ECS IT space.', priority: 'P3', owner: 'No owner named', tags: ['Big Bets', 'Competition'] },
    { text: 'Submit the two Alexion RFPs (Study-Specific ALXN2520-HCM-201 + Patient Identification/Referral & Genetic Testing) — white-space entry point.', priority: 'P3', owner: 'No owner named', tags: ['Account Priorities'] },
  ],
  gsk: [
    { text: 'Stand up the comorbid-claims MLR fast-track lane to clear the Shingrix backlog before the campaign launch window.', priority: 'P1', owner: 'MLR Review Lead', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Rebuild the reconciliation ruleset for the vaccines BU data foundation (IQVIA-adjacent feed) — 140 records blocking submission assembly.', priority: 'P1', owner: 'Wei Chen', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Finalize and roll out the governed AI-content review workflow for the ViiV long-acting regimen work.', priority: 'P2', owner: 'No owner named', tags: ['Big Bets'] },
    { text: 'Publish governed-AI MLR review benchmarks to counter EVERSANA’s AI-review SLA narrative.', priority: 'P2', owner: 'No owner named', tags: ['Competition'] },
    { text: 'Scope the Shingrix comorbid omnichannel + analytics pursuit into a formal proposal.', priority: 'P3', owner: 'Ritesh Dogra', tags: ['Account Priorities'] },
  ],
  jnj: [
    { text: 'Institute the mandatory governance gate before any commercial AI pilot scales — 14 pilots pending review under the enterprise mandate.', priority: 'P1', owner: 'Devika Rao', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Scale the ICOTYDE enablement production pod to close the adoption-vs-capacity gap ahead of field kickoff.', priority: 'P1', owner: 'No owner named', tags: ['Big Bets'] },
    { text: 'Add a China labeling localization specialist to complete Darzalex/Carvykti label finalization.', priority: 'P2', owner: 'Wei Chen', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Formalize the governed-AI operating model proposal for Jennifer Taubert — enterprise, not point-tool.', priority: 'P2', owner: 'No owner named', tags: ['Key Executive Relationships'] },
    { text: 'Pursue the Regulatory headroom with a lifecycle + content-interoperability pitch vs Accenture platform services.', priority: 'P3', owner: 'No owner named', tags: ['Account Priorities', 'Competition'] },
  ],
  novartis: [
    { text: 'Stand up a dedicated Entresto brand-defense pod — turnaround at 74% and competitive-claim rework at 21% ahead of LOE pressure.', priority: 'P1', owner: 'Priya Nandakumar', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Scope Veeva Vault CRM migration readiness before the H2 2026 window closes — budgeted Tech Solutions surge.', priority: 'P1', owner: 'Meera Rao', tags: ['Big Bets'] },
    { text: 'Deliver the platform-agnostic interim CRM data-governance framework to unblock the stalled advisory.', priority: 'P2', owner: 'Devika Rao', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Realign Kisqali oncology content scope/timeline with the brand team.', priority: 'P2', owner: 'No owner named', tags: ['Actions from Last Review'] },
    { text: 'Differentiate migration pitch vs Veeva/Accenture/Cognizant on data-governance depth.', priority: 'P3', owner: 'No owner named', tags: ['Competition'] },
  ],
  sanofi: [
    { text: 'Deploy the multi-market Dupixent patient-services surge team — new-indication localization at 77%, first-time-right at 82%.', priority: 'P1', owner: 'Priya Nandakumar', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Launch the structured field AI-adoption coaching programme — adoption stalled at 48%.', priority: 'P1', owner: 'Devika Rao', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Pitch the integrated MedComm + Omnichannel single-partner consolidation to Julie Van Ongevalle under "Play to Win".', priority: 'P2', owner: 'Ritesh Dogra', tags: ['Big Bets', 'Key Executive Relationships'] },
    { text: 'Add peak-period flex capacity to the immunology med-info desk to hit the 97% SLA.', priority: 'P2', owner: 'Fatima Al-Sayed', tags: ['Delivery & Customer Intelligence'] },
    { text: 'Facilitate the vaccines franchise messaging-guidance lock workshop to unblock the content refresh.', priority: 'P3', owner: 'No owner named', tags: ['Actions from Last Review'] },
  ],
}

export const businessHealthFor = (id: string) => BUSINESS_HEALTH[id]
export const competitionUpdateFor = (id: string) => COMPETITION_UPDATE[id] ?? []
export const deliveryUpdatesFor = (id: string) => DELIVERY_UPDATES[id] ?? []
export const immediateStepsFor = (id: string) => IMMEDIATE_STEPS[id] ?? []
export const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string }> = {
  P1: { label: 'P1', color: 'var(--red)', bg: 'var(--red-bg)' },
  P2: { label: 'P2', color: 'var(--amber)', bg: 'var(--amber-bg)' },
  P3: { label: 'P3', color: 'var(--blue)', bg: 'var(--blue-bg)' },
}
