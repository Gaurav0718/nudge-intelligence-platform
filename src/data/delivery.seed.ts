// ─── DELIVERY HEALTH SEED ─────────────────────────────────────────────────────
// Transcribed from 4_in_one_module.zip → Delivery_Module/*.docx (master §9.2, §11).
// Richer signal-family model: RAG is auto-computed from categorized signal families,
// each with a 3-cycle trend; business impact rated per dimension; dated timeline;
// recovery interventions feed the shared `initiatives` table (module='DeliveryHealth').

import type { ServiceLineId } from './shared'

export type RagStatus = 'Critical' | 'NeedsAttention' | 'Stable'
export type ImpactLevel = 'Low' | 'Medium' | 'High'
export type SignalFamily =
  | 'DeliveryPerformance' | 'RiskCompliance' | 'CustomerSentiment' | 'OperationsData' | 'PeopleData'
export type InterventionStatus = 'AwaitingReview' | 'Accepted' | 'InProgress' | 'Rejected'
export type Confidence = 'High' | 'Medium' | 'Low'

export const SIGNAL_FAMILY_LABEL: Record<SignalFamily, string> = {
  DeliveryPerformance: 'Delivery Performance',
  RiskCompliance: 'Risk & Compliance',
  CustomerSentiment: 'Customer Sentiment',
  OperationsData: 'Operations Data',
  PeopleData: 'People Data',
}

export interface EngagementSignal {
  family: SignalFamily
  label: string
  narrative: string
  trend: [RagStatus, RagStatus, RagStatus]
  current_value?: number
  target_value?: number
  unit?: string
}
export interface TimelineEvent {
  event_date: string
  family: SignalFamily | null
  description: string
  is_current?: boolean
}
export interface RecoveryIntervention {
  id: string
  title: string
  status: InterventionStatus
  confidence: Confidence
  due_date: string
  owner_name: string
  rationale: string
  expected_signal_improvement: string
  evidence_summary: string[]
}
export interface BusinessImpact {
  revenue: ImpactLevel; margin: ImpactLevel; compliance: ImpactLevel
  reputation: ImpactLevel; people: ImpactLevel
}
export interface Engagement {
  id: string
  account_id: string
  service_line: ServiceLineId
  delivery_lead: string
  account_manager?: string
  name: string
  rag_status: RagStatus
  root_cause: string
  business_impact: BusinessImpact
  business_impact_rationale: string
  signals: EngagementSignal[]
  timeline: TimelineEvent[]
  interventions: RecoveryIntervention[]
}

const imp = (revenue: ImpactLevel, margin: ImpactLevel, compliance: ImpactLevel, reputation: ImpactLevel, people: ImpactLevel): BusinessImpact =>
  ({ revenue, margin, compliance, reputation, people })

// ─── AUTO-COMPUTE RAG (master §9.2 rule, verbatim) ────────────────────────────
export function computeRag(signals: EngagementSignal[], impact: BusinessImpact): RagStatus {
  const red = signals.filter(s => s.trend[2] === 'Critical').length
  const amber = signals.filter(s => s.trend[2] === 'NeedsAttention').length
  const highImpact = impact.revenue === 'High' || impact.compliance === 'High' || impact.reputation === 'High'
  if (red >= 2 || (red >= 1 && highImpact)) return 'Critical'
  if (red === 1 || amber >= 1) return 'NeedsAttention'
  return 'Stable'
}

// ══════════════════════════════════════════════════════════════════════════════
// ASTRAZENECA — full-depth transcription
// ══════════════════════════════════════════════════════════════════════════════
export const ENGAGEMENTS: Engagement[] = [
  {
    id: 'az-imfinzi', account_id: 'astrazeneca', service_line: 'Omnichannel', delivery_lead: 'Priya Nair', account_manager: 'Ritesh Dogra',
    name: 'Oncology Omnichannel Launch Support — Imfinzi GEJ', rag_status: 'Critical',
    root_cause: 'The EU approval (March 2026) landed ahead of the originally scoped localization timeline, and MLR substantiation requirements for the new gastric/GEJ indication are materially more extensive than the prior single-indication claim set. The Germany/Italy localization vendor panel was still being finalized when approval landed, adding a further 1–2 week lag.',
    business_impact: imp('High', 'Medium', 'High', 'High', 'Low'),
    business_impact_rationale: "Revenue and reputation are High because Imfinzi's GEJ indication is a strategic growth driver inside AstraZeneca's 45%-of-revenue oncology franchise, and a visibly delayed EU launch ahead of a major GI oncology congress carries outsized visibility. Compliance is High given open MLR queries and flagged promotional claims sit directly on the critical launch path.",
    signals: [
      { family: 'DeliveryPerformance', label: 'HCP asset localization timeliness', narrative: 'EU market localization for the Imfinzi gastric/GEJ label expansion is trailing the go-live calendar, with Germany and Italy furthest behind.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 79, target_value: 95, unit: '%' },
      { family: 'DeliveryPerformance', label: 'First-time-right quality', narrative: 'Medical-legal review is returning a higher-than-usual revision rate on new-indication claims, driven by dosing-language inconsistencies across markets.', trend: ['Stable', 'NeedsAttention', 'Critical'], current_value: 83, target_value: 95, unit: '%' },
      { family: 'RiskCompliance', label: 'Open MLR queries', narrative: 'New-indication substantiation requests are backing up in the MLR queue, with the oldest query now 9 days old.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 6, target_value: 2, unit: 'open' },
      { family: 'CustomerSentiment', label: 'Brand team escalations', narrative: 'Oncology brand team has raised concern about the EU launch timeline slipping ahead of the congress window.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 2, target_value: 0, unit: 'open' },
    ],
    timeline: [
      { event_date: '2026-05-28', family: 'DeliveryPerformance', description: 'EU approval for the Imfinzi gastric/GEJ indication landed roughly three weeks ahead of the internally forecast date.' },
      { event_date: '2026-06-05', family: 'RiskCompliance', description: 'Local vendor panel confirmation for Germany and Italy localization slipped, delaying work start in those markets.' },
      { event_date: '2026-06-18', family: 'DeliveryPerformance', description: 'HCP asset localization timeliness fell to 79% against a 95% target.' },
      { event_date: '2026-06-25', family: 'DeliveryPerformance', description: 'First-time-right quality dropped to 83% amid dosing-language inconsistencies across markets.' },
      { event_date: '2026-07-02', family: 'CustomerSentiment', description: 'Oncology brand team raised two escalations regarding the EU launch timeline.' },
      { event_date: '2026-07-15', family: null, description: 'Project marked Critical due to compounding localization delays, open MLR backlog, and congress-readiness risk.', is_current: true },
    ],
    interventions: [
      { id: 'az-imf-i1', title: 'Deploy a dedicated EU localization surge team for the Imfinzi GEJ launch', status: 'AwaitingReview', confidence: 'High', due_date: '2026-08-01', owner_name: 'Priya Nandakumar', rationale: 'Adds temporary in-market localization capacity to close the go-live gap, prioritizing Germany and Italy given they are furthest behind.', expected_signal_improvement: 'HCP asset localization timeliness above 93% within 3 weeks; all 5 markets congress-ready', evidence_summary: ['Delivery Performance: HCP asset localization timeliness at 79% against a 95% target.', 'Delivery Performance: only 2 of 5 markets are congress-ready ahead of the GI oncology meeting.', 'Customer Sentiment: 2 open brand-team escalations on launch timeline.'] },
      { id: 'az-imf-i2', title: 'Add a second MLR reviewer trained on the new GEJ indication claims', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-28', owner_name: 'MLR Review Lead', rationale: 'Clears the substantiation-request backlog at its source and addresses the two flagged promotional-claim audit findings.', expected_signal_improvement: 'Open MLR queries reduced from 6 to under 2; both flagged claims resolved', evidence_summary: ['Risk & Compliance: 6 open MLR queries tied to new-indication substantiation.', 'Risk & Compliance: 2 promotional claims flagged in routine audit.'] },
      { id: 'az-imf-i3', title: 'Escalate the Germany/Italy localization vendor confirmation to procurement leadership', status: 'Accepted', confidence: 'High', due_date: '2026-07-21', owner_name: 'Devika Rao', rationale: 'Unblocks the root-cause delay that has cascaded into the current localization shortfall.', expected_signal_improvement: 'Vendor panel confirmed within 5 business days', evidence_summary: ['Delivery Performance: localization vendor panel confirmation for Germany and Italy slipped, delaying work start.'] },
    ],
  },
  {
    id: 'az-china-nmpa', account_id: 'astrazeneca', service_line: 'Regulatory', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra',
    name: 'China NMPA Regulatory Submission Support', rag_status: 'Critical',
    root_cause: "AstraZeneca's $15B China R&D expansion (announced January 2026) generated a submission-volume surge that current in-country regulatory-affairs headcount was not scoped to absorb. Several new programmes require CMC translation work the existing linguist pool has not previously handled at this technical depth, slowing first-pass QC.",
    business_impact: imp('Medium', 'Medium', 'High', 'Medium', 'Medium'),
    business_impact_rationale: "Compliance is High because NMPA submission delays carry direct regulatory-timeline risk for AstraZeneca's flagship $15B China R&D commitment. People impact is Medium given the sustained understaffing is now visible to AstraZeneca's own China regulatory leadership.",
    signals: [
      { family: 'DeliveryPerformance', label: 'Dossier localization turnaround', narrative: 'Volume from the new China R&D capacity expansion is outpacing current in-country regulatory-affairs staffing.', trend: ['Stable', 'Critical', 'Critical'], current_value: 71, target_value: 90, unit: '%' },
      { family: 'OperationsData', label: 'Open submission backlog', narrative: 'Backlog has nearly doubled in the past month following the China R&D expansion announcement.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 9, target_value: 4, unit: 'dossiers' },
      { family: 'PeopleData', label: 'In-country regulatory FTE coverage', narrative: 'Current China regulatory-affairs headcount covers roughly two-thirds of the workload generated by the expansion.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 68, target_value: 100, unit: '%' },
    ],
    timeline: [
      { event_date: '2026-01-20', family: 'OperationsData', description: 'AstraZeneca announced its $15B China R&D expansion, setting up the coming submission-volume surge.' },
      { event_date: '2026-06-10', family: 'OperationsData', description: 'Open submission backlog began climbing as new-programme dossiers entered the queue.' },
      { event_date: '2026-06-20', family: 'PeopleData', description: 'In-country regulatory FTE coverage assessed at 68% of the scoped need for current volume.' },
      { event_date: '2026-06-30', family: 'DeliveryPerformance', description: 'Dossier localization turnaround dropped to 71% against a 90% target.' },
      { event_date: '2026-07-15', family: null, description: 'Project marked Critical pending additional in-country regulatory capacity.', is_current: true },
    ],
    interventions: [
      { id: 'az-cn-i1', title: 'Temporarily reassign 2 regulatory affairs specialists from the EU pod to China', status: 'AwaitingReview', confidence: 'High', due_date: '2026-08-08', owner_name: 'Wei Chen', rationale: 'Provides immediate relief to the China dossier backlog while permanent hiring is underway.', expected_signal_improvement: 'Submission backlog reduced from 9 to 4 dossiers within 4 weeks; average dossier age under 14 days', evidence_summary: ['Operations Data: open submission backlog at 9 dossiers against a target of under 4.', 'Operations Data: average dossier age in queue at 22 days against a 10-day target.', 'Delivery Performance: dossier localization turnaround at 71% against a 90% target.'] },
      { id: 'az-cn-i2', title: 'Open a permanent China regulatory-affairs hiring requisition (3 FTE)', status: 'Accepted', confidence: 'Medium', due_date: '2026-09-15', owner_name: 'Devika Rao', rationale: 'Addresses the structural capacity gap created by the $15B China R&D expansion.', expected_signal_improvement: 'In-country regulatory FTE coverage restored to 100% of scoped need', evidence_summary: ['People Data: in-country regulatory FTE coverage at 68% of scoped need.', 'Operations Data: submission volume has structurally increased following the China R&D expansion.'] },
      { id: 'az-cn-i3', title: 'Contract a specialized CMC technical-translation vendor for the current backlog', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-08-05', owner_name: 'Wei Chen', rationale: 'Targets the specific translation QC failures driving first-pass rework.', expected_signal_improvement: 'Translation QC pass rate above 95% within 3 weeks', evidence_summary: ['Delivery Performance: translation QC pass rate at 85% against a 97% target.'] },
    ],
  },
  {
    id: 'az-medcontent-ri', account_id: 'astrazeneca', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra',
    name: 'Medical Content Factory — Respiratory & Immunology', rag_status: 'NeedsAttention',
    root_cause: 'A planned internal transfer of a senior medical writer to the Oncology content pod (supporting the ADC pipeline) has not yet been backfilled on the R&I team. The gap is felt most acutely in scientific-platform deck development, which requires therapy-area-specific fluency newer team members have not yet built.',
    business_impact: imp('Low', 'Medium', 'Low', 'Medium', 'High'),
    business_impact_rationale: 'People impact is High because the root cause is a direct staffing gap rather than a process issue; reputation carries Medium weight given one at-risk congress abstract has external visibility to the scientific community.',
    signals: [
      { family: 'PeopleData', label: 'Medical writer capacity', narrative: 'A planned medical writer transition to the Oncology pod has created a temporary capacity gap on the R&I team.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 4, target_value: 5, unit: 'FTE' },
      { family: 'DeliveryPerformance', label: 'Content review turnaround', narrative: 'Turnaround has slipped modestly since the capacity gap opened, concentrated in scientific-platform decks.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 89, target_value: 95, unit: '%' },
      { family: 'DeliveryPerformance', label: 'Congress abstract submission rate', narrative: 'One of twelve planned R&I congress abstracts is at risk of missing its submission window.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 11, target_value: 12, unit: 'on track' },
    ],
    timeline: [
      { event_date: '2026-06-28', family: 'PeopleData', description: 'Senior medical writer transferred to the Oncology content pod to support ADC pipeline workload.' },
      { event_date: '2026-07-08', family: 'DeliveryPerformance', description: 'Content review turnaround slipped to 89% against a 95% target.' },
      { event_date: '2026-07-12', family: 'DeliveryPerformance', description: 'One of twelve planned R&I congress abstracts flagged as at risk of missing its submission window.' },
      { event_date: '2026-07-15', family: null, description: 'Project marked Needs attention pending R&I writer backfill.', is_current: true },
    ],
    interventions: [
      { id: 'az-ri-i1', title: 'Engage a freelance senior medical writer for R&I coverage', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-25', owner_name: 'Fatima Al-Sayed', rationale: 'Bridges the capacity gap until the internal backfill is complete, with priority given to the at-risk congress abstract.', expected_signal_improvement: 'Content review turnaround restored to 95%+; at-risk abstract submitted on time', evidence_summary: ['People Data: R&I team is 1 medical writer short following an internal transfer.', 'Delivery Performance: 1 of 12 congress abstracts flagged as at risk.'] },
    ],
  },
  {
    id: 'az-evinova', account_id: 'astrazeneca', service_line: 'TechSolutions', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra',
    name: 'Evinova-Adjacent Digital Trial Content Enablement', rag_status: 'Stable',
    root_cause: 'No active issues. The workstream has run on schedule since inception, with the current team configuration well-matched to the content-model refresh workload.',
    business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
    business_impact_rationale: 'All dimensions are Low — a stable workstream with no open risk signals across any tracked metric.',
    signals: [
      { family: 'OperationsData', label: 'Content-model refresh cadence', narrative: 'Digital-trial content models are refreshing on the agreed cadence with no backlog.', trend: ['Stable', 'Stable', 'Stable'], current_value: 100, target_value: 100, unit: '%' },
      { family: 'OperationsData', label: 'Model output accuracy', narrative: 'Accuracy has stayed comfortably above target for four consecutive review cycles.', trend: ['Stable', 'Stable', 'Stable'], current_value: 97, target_value: 95, unit: '%' },
      { family: 'CustomerSentiment', label: 'Stakeholder satisfaction', narrative: 'Evinova-adjacent stakeholders report strong satisfaction with content-model turnaround and accuracy.', trend: ['Stable', 'Stable', 'Stable'], current_value: 92, target_value: 85, unit: '%' },
    ],
    timeline: [
      { event_date: '2026-06-15', family: 'OperationsData', description: 'Model output accuracy confirmed at 97% for the fourth consecutive review cycle.' },
      { event_date: '2026-07-01', family: null, description: 'Project remains stable with strong stakeholder satisfaction and no open risk signals.', is_current: true },
    ],
    interventions: [],
  },
  {
    id: 'az-alexion', account_id: 'astrazeneca', service_line: 'Regulatory', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra',
    name: 'Regulatory Content Migration — Alexion Rare Disease Portfolio', rag_status: 'NeedsAttention',
    root_cause: "Legacy Alexion-era dossier formats require more manual normalization than the original migration scope assumed. Alexion used a different regulatory-information-management system prior to acquisition, whose export structure does not map cleanly onto AstraZeneca's current template fields.",
    business_impact: imp('Medium', 'Low', 'Medium', 'Low', 'Low'),
    business_impact_rationale: "Revenue carries Medium weight because delayed integration of the Alexion portfolio onto standard regulatory templates slows downstream lifecycle-management efficiency for AstraZeneca's rare disease business.",
    signals: [
      { family: 'RiskCompliance', label: 'Migration accuracy', narrative: 'Legacy Alexion dossier formatting is generating more manual correction than initially scoped.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 91, target_value: 99, unit: '%' },
      { family: 'OperationsData', label: 'Migration progress', narrative: 'Progress is behind the agreed cutover schedule due to formatting rework.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 74, target_value: 100, unit: '%' },
      { family: 'OperationsData', label: 'Manual correction rate', narrative: 'Nearly one in five migrated records requires manual formatting correction before it meets the standard template.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 18, target_value: 5, unit: '%' },
    ],
    timeline: [
      { event_date: '2026-06-08', family: 'RiskCompliance', description: 'Initial batch QC revealed higher-than-expected manual correction needs on legacy Alexion formatting.' },
      { event_date: '2026-06-22', family: 'OperationsData', description: 'Migration progress assessed at 74% against a 100% cutover target.' },
      { event_date: '2026-07-05', family: null, description: 'Project marked Needs attention as legacy-format rework continues.', is_current: true },
    ],
    interventions: [
      { id: 'az-alx-i1', title: 'Run a dedicated formatting-normalization pass on the remaining Alexion dossiers', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-22', owner_name: 'Wei Chen', rationale: 'Front-loads the manual correction work so the cutover date is not put at further risk.', expected_signal_improvement: 'Migration progress back on schedule within 2 weeks; accuracy above 97%; manual correction rate under 8%', evidence_summary: ['Operations Data: migration progress at 74% against a 100% cutover target.', 'Risk & Compliance: migration accuracy at 91% against a 99% target.', 'Operations Data: manual correction rate at 18% against a 5% target.'] },
    ],
  },
  {
    id: 'az-disclosure', account_id: 'astrazeneca', service_line: 'Regulatory', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra',
    name: 'Clinical Trial Disclosure & Transparency Support', rag_status: 'Stable',
    root_cause: 'No active issues. The standardized filing checklist introduced in Q4 2025 has held accuracy and timeliness well above target through two consecutive quarters.',
    business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
    business_impact_rationale: 'All dimensions are Low — disclosure filings are consistently ahead of schedule with no compliance exposure.',
    signals: [
      { family: 'DeliveryPerformance', label: 'Disclosure filing timeliness', narrative: 'Consistently ahead of schedule across the ADC pipeline\'s trial disclosure requirements.', trend: ['Stable', 'Stable', 'Stable'], current_value: 100, target_value: 98, unit: '%' },
      { family: 'DeliveryPerformance', label: 'Registry data accuracy', narrative: 'Registry submissions have maintained near-perfect accuracy for two consecutive quarters.', trend: ['Stable', 'Stable', 'Stable'], current_value: 99.4, target_value: 98, unit: '%' },
    ],
    timeline: [
      { event_date: '2026-06-12', family: 'DeliveryPerformance', description: 'Registry data accuracy confirmed at 99.4% for the second consecutive quarter.' },
      { event_date: '2026-07-03', family: null, description: 'Project remains stable with disclosure filings consistently ahead of schedule.', is_current: true },
    ],
    interventions: [],
  },

  ...gskEngagements(),
  ...jnjEngagements(),
  ...novartisEngagements(),
  ...sanofiEngagements(),
]

function gskEngagements(): Engagement[] {
  return [
    {
      id: 'gsk-shingrix', account_id: 'gsk', service_line: 'Omnichannel', delivery_lead: 'Priya Nair', account_manager: 'Ritesh Dogra', name: 'Omnichannel & Medical Analytics — Shingrix Comorbid Strategy', rag_status: 'Critical',
      root_cause: 'A comorbidity-targeting refresh for Shingrix expanded the HCP segmentation model faster than the analytics-to-content handoff was scoped for, and MLR turnaround on the new comorbid claims has lagged, compounding a content-and-compliance bottleneck.',
      business_impact: imp('High', 'Medium', 'High', 'High', 'Low'),
      business_impact_rationale: 'Revenue and reputation are High because Shingrix is a flagship vaccines asset and the comorbid strategy is a visible commercial priority; compliance is High given the new-claim MLR backlog sits on the campaign critical path.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Comorbid content readiness', narrative: 'Segmented HCP content for priority comorbidity cohorts is trailing the campaign calendar.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 76, target_value: 95, unit: '%' },
        { family: 'RiskCompliance', label: 'Open MLR queries (comorbid claims)', narrative: 'New comorbidity claims are backing up in MLR review.', trend: ['Stable', 'NeedsAttention', 'Critical'], current_value: 8, target_value: 3, unit: 'open' },
        { family: 'CustomerSentiment', label: 'Brand team escalations', narrative: 'Vaccines brand team flagged risk to the comorbid campaign launch window.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 2, target_value: 0, unit: 'open' },
      ],
      timeline: [
        { event_date: '2026-06-12', family: 'DeliveryPerformance', description: 'Comorbid content readiness fell to 76% against a 95% target.' },
        { event_date: '2026-06-30', family: 'RiskCompliance', description: 'Open MLR queries on comorbid claims climbed to 8.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical given the compounding content and compliance delays.', is_current: true },
      ],
      interventions: [
        { id: 'gsk-shx-i1', title: 'Stand up a comorbid-claims MLR fast-track lane', status: 'AwaitingReview', confidence: 'High', due_date: '2026-08-02', owner_name: 'MLR Review Lead', rationale: 'Clears the new-claim backlog blocking segmented content.', expected_signal_improvement: 'Open MLR queries under 3 within 3 weeks', evidence_summary: ['Risk & Compliance: 8 open MLR queries on comorbid claims.', 'Delivery Performance: content readiness at 76%.'] },
      ],
    },
    {
      id: 'gsk-vaccines-reg', account_id: 'gsk', service_line: 'Regulatory', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'Regulatory Operations — Vaccines BU Data Foundation (IQVIA-Adjacent)', rag_status: 'Critical',
      root_cause: 'A reconciliation gap between the vaccines regulatory data foundation and an IQVIA-adjacent source feed is producing mismatched records that block clean submission assembly, and the current reconciliation process was not built for the new feed structure.',
      business_impact: imp('Medium', 'Low', 'High', 'Medium', 'Low'),
      business_impact_rationale: 'Compliance is High because reconciliation errors risk submission-data integrity for the vaccines BU.',
      signals: [
        { family: 'RiskCompliance', label: 'Data reconciliation accuracy', narrative: 'Mismatched records between the data foundation and the adjacent feed are above tolerance.', trend: ['Stable', 'Critical', 'Critical'], current_value: 88, target_value: 99, unit: '%' },
        { family: 'OperationsData', label: 'Records pending reconciliation', narrative: 'A growing queue of unreconciled records is blocking submission assembly.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 140, target_value: 30, unit: 'records' },
      ],
      timeline: [
        { event_date: '2026-06-18', family: 'RiskCompliance', description: 'Reconciliation accuracy dropped to 88% against a 99% target.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical pending a reconciliation-process update.', is_current: true },
      ],
      interventions: [
        { id: 'gsk-vax-i1', title: 'Rebuild the reconciliation ruleset for the new adjacent feed', status: 'Accepted', confidence: 'Medium', due_date: '2026-08-12', owner_name: 'Wei Chen', rationale: 'Aligns the reconciliation logic with the new feed structure at the root cause.', expected_signal_improvement: 'Reconciliation accuracy above 99%; pending queue under 30', evidence_summary: ['Risk & Compliance: reconciliation accuracy at 88%.', 'Operations Data: 140 records pending reconciliation.'] },
      ],
    },
    {
      id: 'gsk-viiv', account_id: 'gsk', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra', name: 'Medical Content Factory — ViiV HIV Long-Acting Regimens', rag_status: 'NeedsAttention',
      root_cause: 'A newly introduced AI-assisted content drafting step for long-acting regimen materials lacks a finalized review workflow, so drafts are queueing at human review longer than target.',
      business_impact: imp('Low', 'Low', 'Medium', 'Low', 'Low'),
      business_impact_rationale: 'Compliance carries Medium weight until the AI-assisted content review workflow is formalized.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Content review turnaround', narrative: 'AI-drafted long-acting regimen content is spending longer than target in human review.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 87, target_value: 95, unit: '%' },
        { family: 'OperationsData', label: 'AI-draft rework rate', narrative: 'A share of AI-assisted drafts require substantive rework before review sign-off.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 22, target_value: 10, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-25', family: 'OperationsData', description: 'AI-draft rework rate rose to 22% against a 10% target.' },
        { event_date: '2026-07-07', family: null, description: 'Project marked Needs attention pending a finalized AI-content review workflow.', is_current: true },
      ],
      interventions: [
        { id: 'gsk-viiv-i1', title: 'Finalize and roll out the AI-assisted content review workflow', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-30', owner_name: 'Fatima Al-Sayed', rationale: 'Gives the new AI drafting step a defined human-review gate.', expected_signal_improvement: 'Review turnaround back above 95%; rework under 10%', evidence_summary: ['Operations Data: AI-draft rework at 22%.', 'Delivery Performance: review turnaround at 87%.'] },
      ],
    },
    {
      id: 'gsk-noetik', account_id: 'gsk', service_line: 'DAAI', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'DA & AI — Noetik-Adjacent Oncology Content Readiness', rag_status: 'Stable',
      root_cause: 'No active issues. The oncology content-readiness pipeline is tracking to plan with strong model accuracy.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — stable workstream, no open risk signals.',
      signals: [
        { family: 'OperationsData', label: 'Content-readiness throughput', narrative: 'Oncology content readiness is tracking to plan with no backlog.', trend: ['Stable', 'Stable', 'Stable'], current_value: 98, target_value: 95, unit: '%' },
        { family: 'CustomerSentiment', label: 'Stakeholder satisfaction', narrative: 'Oncology stakeholders report strong satisfaction with turnaround.', trend: ['Stable', 'Stable', 'Stable'], current_value: 90, target_value: 85, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-02', family: null, description: 'Project remains stable with content readiness tracking to plan.', is_current: true }],
      interventions: [],
    },
    {
      id: 'gsk-genmed', account_id: 'gsk', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra', name: 'Integrated Agency — General Medicines Brand Refresh', rag_status: 'NeedsAttention',
      root_cause: 'A brand refresh for the general medicines portfolio is migrating creative onto a new template system, and the migration is trailing the planned cutover schedule.',
      business_impact: imp('Medium', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'Revenue carries Medium weight because the refresh underpins upcoming general-medicines campaigns.',
      signals: [
        { family: 'OperationsData', label: 'Template migration progress', narrative: 'Creative migration to the new template system is behind schedule.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 68, target_value: 100, unit: '%' },
        { family: 'DeliveryPerformance', label: 'Refresh delivery timeliness', narrative: 'Refresh deliverables are trailing the campaign calendar.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 82, target_value: 95, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-28', family: 'OperationsData', description: 'Template migration progress assessed at 68%.' },
        { event_date: '2026-07-10', family: null, description: 'Project marked Needs attention as migration trails the cutover schedule.', is_current: true },
      ],
      interventions: [
        { id: 'gsk-gm-i1', title: 'Add a temporary production pod to accelerate template migration', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-08-01', owner_name: 'Priya Nandakumar', rationale: 'Closes the migration schedule gap ahead of campaign go-lives.', expected_signal_improvement: 'Migration progress back on schedule within 3 weeks', evidence_summary: ['Operations Data: template migration at 68%.', 'Delivery Performance: refresh timeliness at 82%.'] },
      ],
    },
    {
      id: 'gsk-datamodern', account_id: 'gsk', service_line: 'TechSolutions', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'Tech Solutions — US Commercial Data Platform Modernization', rag_status: 'Stable',
      root_cause: 'No active issues. The modernization programme is meeting sprint commitments with high data-quality scores.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — programme is on track.',
      signals: [
        { family: 'OperationsData', label: 'Sprint commitment adherence', narrative: 'Modernization sprints are meeting committed scope consistently.', trend: ['Stable', 'Stable', 'Stable'], current_value: 96, target_value: 90, unit: '%' },
        { family: 'DeliveryPerformance', label: 'Data quality score', narrative: 'Migrated commercial data is passing quality gates above target.', trend: ['Stable', 'Stable', 'Stable'], current_value: 98, target_value: 95, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-01', family: null, description: 'Project remains stable, meeting sprint commitments.', is_current: true }],
      interventions: [],
    },
  ]
}

function jnjEngagements(): Engagement[] {
  return [
    {
      id: 'jnj-icotyde', account_id: 'jnj', service_line: 'Omnichannel', delivery_lead: 'Priya Nair', account_manager: 'Ritesh Dogra', name: 'Launch Readiness Content — ICOTYDE Field Enablement', rag_status: 'Critical',
      root_cause: 'Field-team adoption of the new ICOTYDE enablement content has outpaced the content-production capacity scoped for launch, leaving a widening adoption-vs-capacity gap ahead of the field kickoff.',
      business_impact: imp('High', 'Medium', 'High', 'High', 'Low'),
      business_impact_rationale: 'Revenue, compliance and reputation are High because ICOTYDE is a priority launch and field enablement sits on the critical path to a visible commercial milestone.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Enablement content coverage', narrative: 'Content production is trailing field adoption demand ahead of launch.', trend: ['NeedsAttention', 'Critical', 'Critical'], current_value: 72, target_value: 95, unit: '%' },
        { family: 'PeopleData', label: 'Production capacity utilization', narrative: 'The production pod is running well over sustainable utilization to meet demand.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 128, target_value: 90, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-20', family: 'DeliveryPerformance', description: 'Enablement content coverage fell to 72% against a 95% target.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical given the scale of the adoption-vs-capacity gap.', is_current: true },
      ],
      interventions: [
        { id: 'jnj-ico-i1', title: 'Scale the ICOTYDE enablement production pod for launch', status: 'AwaitingReview', confidence: 'High', due_date: '2026-08-05', owner_name: 'Priya Nandakumar', rationale: 'Adds capacity to close the adoption-vs-capacity gap before field kickoff.', expected_signal_improvement: 'Content coverage above 93%; utilization back under 100%', evidence_summary: ['Delivery Performance: coverage at 72%.', 'People Data: utilization at 128%.'] },
      ],
    },
    {
      id: 'jnj-ai-gov', account_id: 'jnj', service_line: 'DAAI', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'DA & AI — Commercial AI Pilot Governance (Menon Mandate)', rag_status: 'Critical',
      root_cause: 'Commercial AI pilots are scaling faster than the governance framework can review them, creating compliance exposure from ungoverned pilot expansion under the enterprise AI mandate.',
      business_impact: imp('Medium', 'Low', 'High', 'High', 'Low'),
      business_impact_rationale: 'Compliance and reputation are High because ungoverned AI pilot scaling carries direct enterprise-risk exposure.',
      signals: [
        { family: 'RiskCompliance', label: 'Governed pilot coverage', narrative: 'A growing share of active AI pilots have not completed the governance review.', trend: ['NeedsAttention', 'Critical', 'Critical'], current_value: 61, target_value: 100, unit: '%' },
        { family: 'OperationsData', label: 'Pilots pending governance review', narrative: 'The governance review queue has grown as pilots scale.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 14, target_value: 3, unit: 'pilots' },
      ],
      timeline: [
        { event_date: '2026-06-22', family: 'RiskCompliance', description: 'Governed pilot coverage dropped to 61%.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical given the compliance exposure of ungoverned pilot scaling.', is_current: true },
      ],
      interventions: [
        { id: 'jnj-ai-i1', title: 'Institute a mandatory governance gate before any pilot scales', status: 'Accepted', confidence: 'High', due_date: '2026-08-01', owner_name: 'Devika Rao', rationale: 'Stops ungoverned scaling at the source under the enterprise AI mandate.', expected_signal_improvement: 'Governed pilot coverage to 100%; review queue under 3', evidence_summary: ['Risk & Compliance: governed coverage at 61%.', 'Operations Data: 14 pilots pending review.'] },
      ],
    },
    {
      id: 'jnj-tremfya', account_id: 'jnj', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra', name: 'Medical Content Factory — Immunology (Tremfya)', rag_status: 'NeedsAttention',
      root_cause: 'Label-update-driven content refresh for Tremfya is trailing target as multiple concurrent indication updates compress the content-review calendar.',
      business_impact: imp('Medium', 'Low', 'Medium', 'Low', 'Low'),
      business_impact_rationale: 'Revenue and compliance carry Medium weight as timely label-aligned content supports Tremfya commercial continuity.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Label-update content timeliness', narrative: 'Content updates tied to new Tremfya label changes are trailing target.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 84, target_value: 95, unit: '%' },
        { family: 'OperationsData', label: 'Concurrent update load', narrative: 'Several concurrent indication updates are compressing the review calendar.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 5, target_value: 3, unit: 'updates' },
      ],
      timeline: [
        { event_date: '2026-06-27', family: 'DeliveryPerformance', description: 'Label-update content timeliness slipped to 84%.' },
        { event_date: '2026-07-06', family: null, description: 'Project marked Needs attention as label-update timeliness trails target.', is_current: true },
      ],
      interventions: [
        { id: 'jnj-trm-i1', title: 'Sequence concurrent Tremfya label updates with a priority queue', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-29', owner_name: 'Fatima Al-Sayed', rationale: 'Relieves calendar compression from concurrent updates.', expected_signal_improvement: 'Timeliness back above 95% within 3 weeks', evidence_summary: ['Delivery Performance: timeliness at 84%.', 'Operations Data: 5 concurrent updates.'] },
      ],
    },
    {
      id: 'jnj-darzalex', account_id: 'jnj', service_line: 'Regulatory', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'Regulatory Operations — Growth Brand Labeling (Darzalex / Carvykti)', rag_status: 'NeedsAttention',
      root_cause: 'China-specific labeling messaging adaptation for growth brands requires additional localization steps not fully scoped, delaying label finalization.',
      business_impact: imp('Medium', 'Medium', 'Low', 'Medium', 'Low'),
      business_impact_rationale: 'Revenue and reputation carry Medium weight given Darzalex/Carvykti are growth brands with visible labeling milestones.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Label finalization progress', narrative: 'China-specific messaging adaptation is delaying label finalization.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 79, target_value: 95, unit: '%' },
        { family: 'OperationsData', label: 'Localization steps outstanding', narrative: 'Additional China localization steps remain outstanding.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 6, target_value: 2, unit: 'steps' },
      ],
      timeline: [
        { event_date: '2026-06-24', family: 'DeliveryPerformance', description: 'Label finalization progress assessed at 79%.' },
        { event_date: '2026-07-03', family: null, description: 'Project marked Needs attention pending China-specific messaging adaptation.', is_current: true },
      ],
      interventions: [
        { id: 'jnj-dar-i1', title: 'Add a China labeling localization specialist to the pod', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-08-04', owner_name: 'Wei Chen', rationale: 'Completes the outstanding China-specific adaptation steps.', expected_signal_improvement: 'Label finalization above 95% within 3 weeks', evidence_summary: ['Delivery Performance: finalization at 79%.', 'Operations Data: 6 localization steps outstanding.'] },
      ],
    },
    {
      id: 'jnj-vbp', account_id: 'jnj', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra', name: 'Integrated Agency — MedTech China VBP Content Adaptation', rag_status: 'Stable',
      root_cause: 'No active issues. VBP content adaptation is tracking to plan.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — stable workstream.',
      signals: [
        { family: 'OperationsData', label: 'Adaptation throughput', narrative: 'VBP content adaptation is tracking to plan.', trend: ['Stable', 'Stable', 'Stable'], current_value: 97, target_value: 95, unit: '%' },
        { family: 'CustomerSentiment', label: 'Stakeholder satisfaction', narrative: 'MedTech stakeholders report strong satisfaction.', trend: ['Stable', 'Stable', 'Stable'], current_value: 89, target_value: 85, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-01', family: null, description: 'Project remains stable, tracking to plan.', is_current: true }],
      interventions: [],
    },
    {
      id: 'jnj-mlr-platform', account_id: 'jnj', service_line: 'MLR', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'Tech Solutions — MLR Review Capacity Scaling Platform', rag_status: 'Stable',
      root_cause: 'No active issues. The MLR capacity-scaling platform rollout is meeting adoption and throughput targets.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — rollout on track.',
      signals: [
        { family: 'OperationsData', label: 'Platform adoption', narrative: 'MLR reviewers are onboarding onto the new platform on schedule.', trend: ['Stable', 'Stable', 'Stable'], current_value: 94, target_value: 90, unit: '%' },
        { family: 'DeliveryPerformance', label: 'Review throughput uplift', narrative: 'Throughput is improving as the platform scales.', trend: ['Stable', 'Stable', 'Stable'], current_value: 118, target_value: 100, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-02', family: null, description: 'Project remains stable, meeting adoption and throughput targets.', is_current: true }],
      interventions: [],
    },
  ]
}

function novartisEngagements(): Engagement[] {
  return [
    {
      id: 'nvs-entresto', account_id: 'novartis', service_line: 'Omnichannel', delivery_lead: 'Priya Nair', account_manager: 'Meera Rao', name: 'Omnichannel Brand Defense — Entresto Lifecycle', rag_status: 'Critical',
      root_cause: 'Sustained turnaround misses on lifecycle-defense content plus compliance rework on competitive-claim materials have compounded into a critical delivery gap ahead of loss-of-exclusivity pressure.',
      business_impact: imp('High', 'Medium', 'High', 'Medium', 'Low'),
      business_impact_rationale: 'Revenue and compliance are High because Entresto brand defense is time-critical against lifecycle pressure and competitive-claim materials carry compliance exposure.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Defense content turnaround', narrative: 'Turnaround on lifecycle-defense content has missed target for consecutive cycles.', trend: ['NeedsAttention', 'Critical', 'Critical'], current_value: 74, target_value: 95, unit: '%' },
        { family: 'RiskCompliance', label: 'Competitive-claim rework', narrative: 'Competitive-claim materials are returning elevated compliance rework.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 21, target_value: 8, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-16', family: 'DeliveryPerformance', description: 'Defense content turnaround fell to 74%.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical due to sustained turnaround misses and compliance rework.', is_current: true },
      ],
      interventions: [
        { id: 'nvs-ent-i1', title: 'Stand up a dedicated Entresto brand-defense pod', status: 'AwaitingReview', confidence: 'High', due_date: '2026-08-03', owner_name: 'Priya Nandakumar', rationale: 'Concentrates capacity and compliance expertise on the time-critical defense workstream.', expected_signal_improvement: 'Turnaround above 93%; competitive-claim rework under 8%', evidence_summary: ['Delivery Performance: turnaround at 74%.', 'Risk & Compliance: rework at 21%.'] },
      ],
    },
    {
      id: 'nvs-crm', account_id: 'novartis', service_line: 'DAAI', delivery_lead: 'Arjun Mehta', account_manager: 'Meera Rao', name: 'Commercial CRM Data Governance Advisory', rag_status: 'Critical',
      root_cause: 'The advisory workstream is gated on a Novartis CRM platform evaluation whose timeline has slipped, blocking data-governance recommendations that depend on the target-state platform decision.',
      business_impact: imp('Medium', 'Low', 'Medium', 'Medium', 'Low'),
      business_impact_rationale: 'Compliance and reputation carry Medium weight because governance recommendations are stalled on an external evaluation dependency visible to the client.',
      signals: [
        { family: 'OperationsData', label: 'Advisory milestone progress', narrative: 'Governance recommendations are blocked pending the CRM evaluation decision.', trend: ['Stable', 'Critical', 'Critical'], current_value: 55, target_value: 90, unit: '%' },
        { family: 'RiskCompliance', label: 'Open governance gaps', narrative: 'Identified data-governance gaps remain open pending the platform decision.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 11, target_value: 3, unit: 'gaps' },
      ],
      timeline: [
        { event_date: '2026-06-19', family: 'OperationsData', description: 'Advisory milestone progress stalled at 55% on the CRM evaluation dependency.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical given the CRM evaluation timeline dependency.', is_current: true },
      ],
      interventions: [
        { id: 'nvs-crm-i1', title: 'Deliver a platform-agnostic interim governance framework', status: 'Accepted', confidence: 'Medium', due_date: '2026-08-10', owner_name: 'Devika Rao', rationale: 'Unblocks progress by decoupling governance recommendations from the pending CRM decision.', expected_signal_improvement: 'Advisory progress above 85%; open gaps under 3', evidence_summary: ['Operations Data: milestone progress at 55%.', 'Risk & Compliance: 11 open governance gaps.'] },
      ],
    },
    {
      id: 'nvs-kisqali', account_id: 'novartis', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Meera Rao', name: 'Medical Content Factory — Oncology (Kisqali)', rag_status: 'NeedsAttention',
      root_cause: 'A scope expansion on Kisqali oncology content outran the original timeline, requiring a scope-timeline realignment.',
      business_impact: imp('Medium', 'Low', 'Medium', 'Low', 'Low'),
      business_impact_rationale: 'Revenue and compliance carry Medium weight given Kisqali content supports active oncology commercial priorities.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Content delivery timeliness', narrative: 'Expanded scope has pushed delivery behind the original timeline.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 85, target_value: 95, unit: '%' },
        { family: 'OperationsData', label: 'Scope-to-capacity ratio', narrative: 'Expanded scope exceeds the originally scoped capacity.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 130, target_value: 100, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-26', family: 'DeliveryPerformance', description: 'Content delivery timeliness slipped to 85% after scope expansion.' },
        { event_date: '2026-07-05', family: null, description: 'Project marked Needs attention pending a scope-timeline realignment.', is_current: true },
      ],
      interventions: [
        { id: 'nvs-kis-i1', title: 'Realign Kisqali scope and timeline with the brand team', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-28', owner_name: 'Fatima Al-Sayed', rationale: 'Rebaselines the plan to the expanded scope.', expected_signal_improvement: 'Timeliness back above 95% against the rebaselined plan', evidence_summary: ['Delivery Performance: timeliness at 85%.', 'Operations Data: scope-to-capacity at 130%.'] },
      ],
    },
    {
      id: 'nvs-cosentyx', account_id: 'novartis', service_line: 'Regulatory', delivery_lead: 'Arjun Mehta', account_manager: 'Meera Rao', name: 'Regulatory Operations — Cosentyx Line Extensions', rag_status: 'Stable',
      root_cause: 'No active issues. Cosentyx line-extension submissions are tracking to plan.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — stable workstream.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Submission timeliness', narrative: 'Line-extension submissions are on schedule.', trend: ['Stable', 'Stable', 'Stable'], current_value: 98, target_value: 95, unit: '%' },
        { family: 'RiskCompliance', label: 'Submission quality', narrative: 'Submission quality is above target.', trend: ['Stable', 'Stable', 'Stable'], current_value: 99, target_value: 97, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-01', family: null, description: 'Project remains stable, tracking to plan.', is_current: true }],
      interventions: [],
    },
    {
      id: 'nvs-leqvio', account_id: 'novartis', service_line: 'Omnichannel', delivery_lead: 'Sara Khan', account_manager: 'Meera Rao', name: 'Integrated Agency Support — Leqvio Field Enablement', rag_status: 'NeedsAttention',
      root_cause: 'Field-team site onboarding for Leqvio enablement is exceeding target cycle time as onboarding volume rises.',
      business_impact: imp('Medium', 'Low', 'Low', 'Medium', 'Low'),
      business_impact_rationale: 'Revenue and reputation carry Medium weight given Leqvio field enablement supports commercial ramp.',
      signals: [
        { family: 'OperationsData', label: 'Site onboarding cycle time', narrative: 'Onboarding cycle time exceeds target as volume rises.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 14, target_value: 8, unit: 'days' },
        { family: 'DeliveryPerformance', label: 'Enablement completion rate', narrative: 'Enablement completion is trailing target.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 86, target_value: 95, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-29', family: 'OperationsData', description: 'Site onboarding cycle time rose to 14 days against an 8-day target.' },
        { event_date: '2026-07-09', family: null, description: 'Project marked Needs attention as site onboarding cycle time exceeds target.', is_current: true },
      ],
      interventions: [
        { id: 'nvs-leq-i1', title: 'Streamline the Leqvio site-onboarding workflow', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-08-02', owner_name: 'Priya Nandakumar', rationale: 'Reduces onboarding cycle time under rising volume.', expected_signal_improvement: 'Cycle time under 8 days; completion above 95%', evidence_summary: ['Operations Data: cycle time at 14 days.', 'Delivery Performance: completion at 86%.'] },
      ],
    },
    {
      id: 'nvs-pluvicto', account_id: 'novartis', service_line: 'TechSolutions', delivery_lead: 'Arjun Mehta', account_manager: 'Meera Rao', name: 'Tech Solutions — Pluvicto Site Enablement Portal', rag_status: 'Stable',
      root_cause: 'No active issues. The Pluvicto site enablement portal is meeting uptime and adoption targets.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — portal is on track.',
      signals: [
        { family: 'OperationsData', label: 'Portal adoption', narrative: 'Sites are adopting the portal on schedule.', trend: ['Stable', 'Stable', 'Stable'], current_value: 92, target_value: 88, unit: '%' },
        { family: 'DeliveryPerformance', label: 'Portal uptime', narrative: 'Portal uptime is above target.', trend: ['Stable', 'Stable', 'Stable'], current_value: 99.8, target_value: 99, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-01', family: null, description: 'Project remains stable, meeting uptime and adoption targets.', is_current: true }],
      interventions: [],
    },
  ]
}

function sanofiEngagements(): Engagement[] {
  return [
    {
      id: 'snf-dupixent', account_id: 'sanofi', service_line: 'Omnichannel', delivery_lead: 'Priya Nair', account_manager: 'Ritesh Dogra', name: 'Omnichannel Patient Services — Dupixent New Indications', rag_status: 'Critical',
      root_cause: 'New Dupixent indications expanded patient-services content scope, and localization plus first-time-right quality pressure across markets compounded into a critical delivery gap.',
      business_impact: imp('High', 'Medium', 'Medium', 'High', 'Low'),
      business_impact_rationale: 'Revenue and reputation are High because Dupixent is Sanofi\'s flagship immunology asset and new-indication patient services carry high visibility.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Patient-services localization', narrative: 'New-indication content localization is trailing the market rollout calendar.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 77, target_value: 95, unit: '%' },
        { family: 'DeliveryPerformance', label: 'First-time-right quality', narrative: 'Quality rework has risen across new-indication content.', trend: ['Stable', 'NeedsAttention', 'Critical'], current_value: 82, target_value: 95, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-17', family: 'DeliveryPerformance', description: 'Patient-services localization fell to 77% across markets.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical due to compounding localization and quality pressure.', is_current: true },
      ],
      interventions: [
        { id: 'snf-dup-i1', title: 'Deploy a multi-market patient-services surge team', status: 'AwaitingReview', confidence: 'High', due_date: '2026-08-04', owner_name: 'Priya Nandakumar', rationale: 'Closes the localization and quality gap for new Dupixent indications.', expected_signal_improvement: 'Localization above 93%; first-time-right above 95%', evidence_summary: ['Delivery Performance: localization at 77%.', 'Delivery Performance: first-time-right at 82%.'] },
      ],
    },
    {
      id: 'snf-fieldchange', account_id: 'sanofi', service_line: 'DAAI', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'Field Change-Management Enablement — AI Adoption', rag_status: 'Critical',
      root_cause: 'Field AI-tool adoption is stalling without a structured coaching intervention, and the people-side change gap is now the primary blocker to realizing the adoption target.',
      business_impact: imp('Medium', 'Low', 'Low', 'Medium', 'High'),
      business_impact_rationale: 'People impact is High because the blocker is a field change-management gap; reputation carries Medium weight given adoption is a visible transformation commitment.',
      signals: [
        { family: 'PeopleData', label: 'Field AI-tool adoption', narrative: 'Field adoption of the new AI tools has stalled below target.', trend: ['NeedsAttention', 'Critical', 'Critical'], current_value: 48, target_value: 80, unit: '%' },
        { family: 'CustomerSentiment', label: 'Field confidence score', narrative: 'Field confidence in the new tools is below the readiness threshold.', trend: ['NeedsAttention', 'NeedsAttention', 'Critical'], current_value: 52, target_value: 75, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-15', family: 'PeopleData', description: 'Field AI-tool adoption stalled at 48% against an 80% target.' },
        { event_date: '2026-07-15', family: null, description: 'Project marked Critical pending a structured field-coaching intervention.', is_current: true },
      ],
      interventions: [
        { id: 'snf-fld-i1', title: 'Launch a structured field AI-adoption coaching programme', status: 'Accepted', confidence: 'High', due_date: '2026-08-06', owner_name: 'Devika Rao', rationale: 'Addresses the people-side change gap blocking adoption.', expected_signal_improvement: 'Adoption above 80%; field confidence above 75%', evidence_summary: ['People Data: adoption at 48%.', 'Customer Sentiment: field confidence at 52%.'] },
      ],
    },
    {
      id: 'snf-medinfo', account_id: 'sanofi', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra', name: 'Medical Information Response Desk — Immunology', rag_status: 'NeedsAttention',
      root_cause: 'Response SLA adherence is trending toward — but not yet at — target as immunology inquiry volume rises.',
      business_impact: imp('Low', 'Medium', 'Medium', 'Medium', 'Medium'),
      business_impact_rationale: 'Multiple dimensions carry Medium weight as the med-info desk is client- and HCP-facing.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Response SLA adherence', narrative: 'SLA adherence is trending toward target as volume rises.', trend: ['NeedsAttention', 'NeedsAttention', 'NeedsAttention'], current_value: 91, target_value: 97, unit: '%' },
        { family: 'OperationsData', label: 'Inquiry backlog', narrative: 'A modest inquiry backlog persists at peak periods.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 24, target_value: 10, unit: 'open' },
      ],
      timeline: [
        { event_date: '2026-06-28', family: 'DeliveryPerformance', description: 'Response SLA adherence measured at 91% against a 97% target.' },
        { event_date: '2026-07-06', family: null, description: 'Project marked Needs attention as response SLA adherence trends toward target.', is_current: true },
      ],
      interventions: [
        { id: 'snf-mi-i1', title: 'Add peak-period flex capacity to the med-info desk', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-30', owner_name: 'Fatima Al-Sayed', rationale: 'Closes the SLA gap at peak inquiry periods.', expected_signal_improvement: 'SLA adherence above 97%; backlog under 10', evidence_summary: ['Delivery Performance: SLA adherence at 91%.', 'Operations Data: backlog at 24.'] },
      ],
    },
    {
      id: 'snf-venglustat', account_id: 'sanofi', service_line: 'Regulatory', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'Regulatory Operations — Venglustat Rare Disease Filings', rag_status: 'Stable',
      root_cause: 'No active issues. Venglustat rare-disease filings are tracking to plan.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — stable workstream.',
      signals: [
        { family: 'DeliveryPerformance', label: 'Filing timeliness', narrative: 'Rare-disease filings are on schedule.', trend: ['Stable', 'Stable', 'Stable'], current_value: 97, target_value: 95, unit: '%' },
        { family: 'RiskCompliance', label: 'Filing quality', narrative: 'Filing quality is above target.', trend: ['Stable', 'Stable', 'Stable'], current_value: 99, target_value: 97, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-01', family: null, description: 'Project remains stable, tracking to plan.', is_current: true }],
      interventions: [],
    },
    {
      id: 'snf-vaccines', account_id: 'sanofi', service_line: 'MedComm', delivery_lead: 'Sara Khan', account_manager: 'Ritesh Dogra', name: 'Integrated Agency — Vaccines Franchise Content Refresh', rag_status: 'NeedsAttention',
      root_cause: 'A vaccines franchise content refresh is paused on updated messaging guidance that has not yet been finalized by the brand team.',
      business_impact: imp('Medium', 'Low', 'Low', 'Medium', 'Low'),
      business_impact_rationale: 'Revenue and reputation carry Medium weight given the refresh supports the vaccines franchise.',
      signals: [
        { family: 'OperationsData', label: 'Refresh progress', narrative: 'Refresh progress is paused pending finalized messaging guidance.', trend: ['Stable', 'NeedsAttention', 'NeedsAttention'], current_value: 66, target_value: 100, unit: '%' },
        { family: 'CustomerSentiment', label: 'Brand alignment', narrative: 'Brand-team messaging guidance remains in flux.', trend: ['Stable', 'Stable', 'NeedsAttention'], current_value: 70, target_value: 95, unit: '%' },
      ],
      timeline: [
        { event_date: '2026-06-27', family: 'OperationsData', description: 'Refresh progress stalled at 66% pending messaging guidance.' },
        { event_date: '2026-07-04', family: null, description: 'Project marked Needs attention pending updated franchise messaging guidance.', is_current: true },
      ],
      interventions: [
        { id: 'snf-vax-i1', title: 'Facilitate a messaging-guidance lock workshop with the brand team', status: 'AwaitingReview', confidence: 'Medium', due_date: '2026-07-31', owner_name: 'Priya Nandakumar', rationale: 'Unblocks the refresh by finalizing the pending guidance.', expected_signal_improvement: 'Refresh progress resumes to plan; brand alignment above 95%', evidence_summary: ['Operations Data: refresh progress at 66%.', 'Customer Sentiment: brand alignment at 70%.'] },
      ],
    },
    {
      id: 'snf-cmc', account_id: 'sanofi', service_line: 'TechSolutions', delivery_lead: 'Arjun Mehta', account_manager: 'Ritesh Dogra', name: 'Tech Solutions — CMC Variation Tracking for Dupixent Formulations', rag_status: 'Stable',
      root_cause: 'No active issues. The CMC variation tracking system is meeting accuracy and throughput targets.',
      business_impact: imp('Low', 'Low', 'Low', 'Low', 'Low'),
      business_impact_rationale: 'All dimensions Low — system is on track.',
      signals: [
        { family: 'OperationsData', label: 'Variation tracking accuracy', narrative: 'Variation records are tracked accurately above target.', trend: ['Stable', 'Stable', 'Stable'], current_value: 99, target_value: 97, unit: '%' },
        { family: 'DeliveryPerformance', label: 'Tracking throughput', narrative: 'Throughput is meeting target.', trend: ['Stable', 'Stable', 'Stable'], current_value: 100, target_value: 95, unit: '%' },
      ],
      timeline: [{ event_date: '2026-07-01', family: null, description: 'Project remains stable, meeting accuracy and throughput targets.', is_current: true }],
      interventions: [],
    },
  ]
}

export const engagementsForAccount = (accountId: string) => ENGAGEMENTS.filter(e => e.account_id === accountId)
export const engagementById = (id: string) => ENGAGEMENTS.find(e => e.id === id)

// ─── RAG mapping helpers (reference uses red/amber/green) ──────────────────────
export type Rag = 'red' | 'amber' | 'green'
export const ragOf = (s: RagStatus): Rag => (s === 'Critical' ? 'red' : s === 'NeedsAttention' ? 'amber' : 'green')
export const ragLabel = (r: Rag) => (r === 'red' ? 'Critical' : r === 'amber' ? 'Needs attention' : 'Stable')
export const signalRag = (trend: [RagStatus, RagStatus, RagStatus]): Rag => ragOf(trend[2])
export const ALL_SIGNAL_FAMILIES: SignalFamily[] = ['DeliveryPerformance', 'RiskCompliance', 'CustomerSentiment', 'OperationsData', 'PeopleData']

// ─── Account-level insights (reference `accountInsights` schema) ───────────────
export interface InsightCardData { title: string; confidence: Confidence; text: string; evidence: string[] }
export interface AccountInsights { priorities: InsightCardData; concerns: InsightCardData; positive: InsightCardData }

export const ACCOUNT_INSIGHTS: Record<string, AccountInsights> = {
  astrazeneca: {
    priorities: { title: 'EU launch localization back on track', confidence: 'High', text: 'Stakeholders expect the Imfinzi GEJ EU localization and MLR backlog cleared ahead of the GI oncology congress window.', evidence: ['Delivery Performance — HCP asset localization at 79% against a 95% target', 'Project: Oncology Omnichannel Launch Support — Imfinzi GEJ'] },
    concerns: { title: 'China NMPA capacity gap', confidence: 'High', text: 'The $15B China R&D expansion generated submission volume that current in-country regulatory headcount cannot absorb.', evidence: ['People Data — in-country regulatory FTE coverage at 68% of scoped need', 'Operations Data — open submission backlog at 9 dossiers'] },
    positive: { title: 'Evinova digital-trial workstream stable', confidence: 'High', text: 'Content-model accuracy has stayed above target for four consecutive cycles with strong stakeholder satisfaction.', evidence: ['Operations Data — model output accuracy at 97% for the fourth cycle', 'Project: Evinova-Adjacent Digital Trial Content Enablement'] },
  },
  gsk: {
    priorities: { title: 'Shingrix comorbid campaign readiness', confidence: 'High', text: 'Stakeholders expect segmented comorbid content and the new-claim MLR backlog cleared before the campaign launch window.', evidence: ['Delivery Performance — comorbid content readiness at 76% against a 95% target', 'Project: Omnichannel & Medical Analytics — Shingrix Comorbid Strategy'] },
    concerns: { title: 'Vaccines data-foundation reconciliation', confidence: 'Medium', text: 'Mismatched records against the IQVIA-adjacent feed are blocking clean submission assembly for the vaccines BU.', evidence: ['Risk & Compliance — reconciliation accuracy at 88% against a 99% target', 'Operations Data — 140 records pending reconciliation'] },
    positive: { title: 'US commercial data modernization on track', confidence: 'High', text: 'The modernization programme is meeting sprint commitments with high data-quality scores.', evidence: ['Delivery Performance — data quality score at 98%', 'Project: Tech Solutions — US Commercial Data Platform Modernization'] },
  },
  jnj: {
    priorities: { title: 'ICOTYDE launch enablement at scale', confidence: 'High', text: 'Field adoption is outpacing enablement content production ahead of the ICOTYDE field kickoff.', evidence: ['Delivery Performance — enablement content coverage at 72% against a 95% target', 'Project: Launch Readiness Content — ICOTYDE Field Enablement'] },
    concerns: { title: 'Ungoverned AI pilot scaling', confidence: 'High', text: 'Commercial AI pilots are scaling faster than governance review under the enterprise AI mandate, creating compliance exposure.', evidence: ['Risk & Compliance — governed pilot coverage at 61%', 'Operations Data — 14 pilots pending governance review'] },
    positive: { title: 'MLR capacity platform adoption', confidence: 'High', text: 'The MLR capacity-scaling platform rollout is meeting adoption and throughput targets.', evidence: ['Delivery Performance — review throughput uplift at 118%', 'Project: Tech Solutions — MLR Review Capacity Scaling Platform'] },
  },
  novartis: {
    priorities: { title: 'Entresto lifecycle brand defense', confidence: 'High', text: 'Stakeholders expect defense content turnaround and competitive-claim compliance restored ahead of loss-of-exclusivity pressure.', evidence: ['Delivery Performance — defense content turnaround at 74% against a 95% target', 'Project: Omnichannel Brand Defense — Entresto Lifecycle'] },
    concerns: { title: 'CRM evaluation dependency', confidence: 'Medium', text: 'Data-governance recommendations are stalled pending the Novartis CRM platform decision.', evidence: ['Operations Data — advisory milestone progress at 55%', 'Risk & Compliance — 11 open governance gaps'] },
    positive: { title: 'Cosentyx submissions steady', confidence: 'High', text: 'Cosentyx line-extension submissions are on schedule with quality above target.', evidence: ['Delivery Performance — submission timeliness at 98%', 'Project: Regulatory Operations — Cosentyx Line Extensions'] },
  },
  sanofi: {
    priorities: { title: 'Dupixent new-indication patient services', confidence: 'High', text: 'Stakeholders expect new-indication localization and quality restored across markets for the Dupixent rollout.', evidence: ['Delivery Performance — patient-services localization at 77% against a 95% target', 'Project: Omnichannel Patient Services — Dupixent New Indications'] },
    concerns: { title: 'Field AI adoption stalled', confidence: 'High', text: 'Field AI-tool adoption has stalled without a structured coaching intervention — a people-side change gap.', evidence: ['People Data — field AI-tool adoption at 48% against an 80% target', 'Customer Sentiment — field confidence at 52%'] },
    positive: { title: 'CMC variation tracking reliable', confidence: 'High', text: 'The CMC variation tracking system is meeting accuracy and throughput targets.', evidence: ['Operations Data — variation tracking accuracy at 99%', 'Project: Tech Solutions — CMC Variation Tracking for Dupixent Formulations'] },
  },
}
export const insightsForAccount = (accountId: string) => ACCOUNT_INSIGHTS[accountId]
