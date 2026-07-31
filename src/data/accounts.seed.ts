// ─── ACCOUNTS HUB SEED (cross-module dossier) ─────────────────────────────────
// Re-keyed from the Growth module's Freyr/Revance/Takeda demo to Company serving
// the 5 core pharma accounts (master §1.1, §8, §14).

export interface DossierSection {
  key: string
  title: string
  layer: 'Account' | 'Business' | 'Growth' | 'Execution' | 'Workspace'
  body: string
  bullets?: string[]
}

export interface AccountExec {
  id: string
  account_id: string
  name: string
  title: string
  relationship: 'Champion' | 'Warm' | 'Cold' | 'WhiteSpace'
  company_role: string
  career_history: string[]
  key_traits: { name: string; summary: string }[]
  sales_do: string[]
  sales_dont: string[]
  indegene_selling_point: string
  /** Distinct implication — why this person/relationship matters beyond the selling point itself. */
  why_it_matters: string
  /** Distinct, specific outcome of the Next Best Action — never a repeat of the selling point. */
  nba_outcome: string
}

export interface OrgPerson {
  id: string
  name: string
  title: string
  parent_id: string | null
  relationship: 'Champion' | 'Warm' | 'Cold' | 'WhiteSpace'
}

export interface AccountPlanSection {
  section_key: string
  title: string
  content: string
}

export interface AccountDossier {
  account_id: string
  one_minute_summary: string
  emerging_priorities: string[]
  big_bets: { title: string; body: string }[]
  right_to_win: string[]
  next_best_actions: string[]
  sections: DossierSection[]
  execs: AccountExec[]
  org: OrgPerson[]
  plan: AccountPlanSection[]
}

function sections(a: {
  context: string; org: string; priorities: string; buyer: string; competitive: string;
  delivery: string; growth: string; risks: string; exec: string; notes: string
}): DossierSection[] {
  return [
    { key: 'company-overview', title: 'Company Overview', layer: 'Account', body: a.context },
    { key: 'strategic-context', title: 'Strategic Context', layer: 'Account', body: a.priorities },
    { key: 'org-leadership', title: 'Organisation & Leadership', layer: 'Account', body: a.org },
    { key: 'buyer-coverage', title: 'Buyer Coverage & Relationship Map', layer: 'Business', body: a.buyer },
    { key: 'business-priorities', title: 'Business Priorities', layer: 'Business', body: a.priorities },
    { key: 'competitive-landscape', title: 'Competitive Landscape', layer: 'Business', body: a.competitive },
    { key: 'right-to-win', title: 'Right to Win', layer: 'Growth', body: a.growth },
    { key: 'whitespace', title: 'Whitespace & Cross-Sell', layer: 'Growth', body: a.growth },
    { key: 'growth-thesis', title: 'Growth Thesis', layer: 'Growth', body: a.growth },
    { key: 'delivery-health', title: 'Delivery Health Snapshot', layer: 'Execution', body: a.delivery },
    { key: 'active-engagements', title: 'Active Engagements', layer: 'Execution', body: a.delivery },
    { key: 'risks-watchlist', title: 'Risks & Watchlist', layer: 'Execution', body: a.risks },
    { key: 'exec-relationships', title: 'Executive Relationships', layer: 'Workspace', body: a.exec },
    { key: 'next-best-actions', title: 'Next Best Actions', layer: 'Workspace', body: a.priorities },
    { key: 'account-notes', title: 'Account Notes', layer: 'Workspace', body: a.notes },
    { key: 'briefing', title: 'Executive Briefing', layer: 'Workspace', body: 'Generate a client-facing executive briefing deck for this account.' },
    { key: 'signals-layer', title: 'Cross-Module Signals', layer: 'Workspace', body: 'Live roll-up of Delivery Health RAG, open Competition signals, and Marketing share-of-voice for this account.' },
  ]
}

const AZ: AccountDossier = {
  account_id: 'astrazeneca',
  one_minute_summary: 'AstraZeneca is a global, science-led biopharmaceutical company headquartered in Cambridge, UK, organised around Oncology, BioPharmaceuticals and Rare Disease (via Alexion). CEO Sir Pascal Soriot has set a public target of $80B in annual sales by 2030, anchored by an oncology franchise delivering 45% of product revenue. Two capital commitments define the near-term context: a $50B US manufacturing pledge (July 2025) and a $15B China R&D expansion (January 2026). For Company, the value case rests on unmatched oncology submission volume, a fresh China regulatory workload, and a live competitive-technology threat from Evinova\'s Accenture/AWS partnership.',
  emerging_priorities: [
    'Reach $80B in annual sales by 2030 — anchored by oncology (45% of product revenue) and an 8-asset wholly-owned ADC pipeline.',
    'Execute the $15B China R&D expansion without disrupting the parallel $50B US manufacturing build-out.',
    'Advance Imfinzi label expansion (gastric/GEJ) and camizestrant regulatory reviews across US/EU.',
    'Scale Evinova, the standalone digital-health subsidiary, via Accenture/AWS and CRO distribution.',
    'Manage the Enhertu co-marketing relationship with Daiichi Sankyo — a cross-company regulatory workload.',
    'Model and absorb US Most-Favored-Nation drug-pricing policy impact.',
  ],
  big_bets: [
    { title: 'Oncology submission scale — the ADC pipeline', body: '8 wholly-owned ADCs in clinic, each generating full multi-market submission packages plus lifecycle maintenance — directly applicable to Company Regulatory Operations and content supply at a scale few accounts match.' },
    { title: 'The China R&D build-out — a dated, bounded NMPA opportunity', body: 'The $15B expansion is new enough that AstraZeneca\'s incremental China regulatory vendor panel is plausibly still forming — a clean entry point for dossier localisation and CMC variation surge support.' },
    { title: 'Evinova — competitive-urgency signal, not a direct target', body: 'Evinova\'s Accenture/AWS partnership shows AstraZeneca moves fast on external tech in adjacent-to-regulatory digital health. If SI-led automation expands before Company is in the conversation, the technology window narrows.' },
  ],
  right_to_win: [
    'China regulatory depth at the moment of maximum relevance — timing is the advantage, not just capability.',
    'Cross-company coordination capability for the Enhertu / Daiichi Sankyo co-marketing regulatory workload.',
    'Governed, audit-ready intelligence as a proof point amid a live data-governance scrutiny backdrop.',
  ],
  next_best_actions: [
    'Request a China regulatory-operations discovery session before the incremental vendor panel closes.',
    'Enter AstraZeneca technology conversations ahead of Accenture-led automation expansion.',
    'Package Imfinzi GEJ launch-support proof points for the active omnichannel pursuit.',
  ],
  sections: sections({
    context: 'Global science-led biopharma; Oncology, BioPharmaceuticals, Rare Disease (Alexion). $80B-by-2030 ambition under CEO Sir Pascal Soriot.',
    org: 'CEO Sir Pascal Soriot (14th year); CFO Aradhana Sarin; Evinova President Cristina Durán; EVP Oncology R&D Susan Galbraith. Currently white-space for Company at CEO level — earn top-of-account access through delivery lower in the organisation.',
    priorities: 'Oncology submission scale, dual US/China capital build-out, Imfinzi/camizestrant label programmes, Evinova scale-up, Enhertu co-marketing coordination, MFN pricing absorption.',
    buyer: 'All buyer rows currently white-space — no confirmed Company relationship at any level. Entry strategy: bottom-up through Oncology and China regulatory leads.',
    competitive: 'Accenture/AWS active in digital health via Evinova; large SIs (ICON, Parexel) inferred present in regulatory operations. ZS strong in commercial analytics.',
    delivery: '2 Critical engagements (Imfinzi GEJ omnichannel, China NMPA regulatory), 2 Needs-attention (R&I medical content, Alexion migration), 2 Stable. Overall posture: elevated attention on launch-critical and China regulatory workstreams.',
    growth: 'Right to win on China regulatory timing, cross-company coordination, and governed intelligence. Whitespace in technology track and Enhertu coordination.',
    risks: 'SI-led automation encroachment via Evinova; China compliance scrutiny; MFN pricing pressure on downstream budgets.',
    exec: 'Soriot: cold, long-term priority (route through lieutenants). Sarin: finance-adjacent proof points. Durán: digital-health/partnership entry.',
    notes: 'White-space flagship account. Prioritise a China regulatory beachhead and a technology discovery session this quarter.',
  }),
  execs: [
    { id: 'az-soriot', account_id: 'astrazeneca', name: 'Sir Pascal Soriot', title: 'Chief Executive Officer', relationship: 'Cold', company_role: 'CEO of AstraZeneca since 2012; architect of the $80B-by-2030 ambition and the dual US/China capital build-out.', career_history: ['CEO, AstraZeneca (2012–present)', 'COO, Roche Pharmaceuticals', 'CEO, Genentech commercial ops'], key_traits: [{ name: 'Long-cycle strategist', summary: 'Thinks in multi-year capital-deployment horizons; frames China/US balancing publicly.' }, { name: 'Technically credible', summary: 'Expects specific, mechanism-level substance, not capability overviews.' }], sales_do: ['Lead with the specific China NMPA or US oncology-submission workload Company would address.', 'Reference the scale of the dual US/China build-out as the reason the timing is right.'], sales_dont: ['Don\'t open with a generic "AI-powered regulatory platform" pitch.', 'Don\'t attempt to reach him before a Core Services relationship exists lower in the organisation.'], indegene_selling_point: 'Company\'s China regulatory depth and cross-company coordination capability map precisely onto AstraZeneca\'s dated, quantified China and Enhertu workloads.', why_it_matters: 'Soriot personally carries the dual US/China capital build-out — a partner that de-risks that execution earns account-level standing.', nba_outcome: 'Soriot signals Company as the credible regulatory-capacity partner behind the China build-out, sponsoring the named China NMPA or oncology-submission pilot.' },
    { id: 'az-sarin', account_id: 'astrazeneca', name: 'Aradhana Sarin', title: 'Chief Financial Officer', relationship: 'Cold', company_role: 'CFO overseeing capital allocation across the $50B US and $15B China commitments.', career_history: ['CFO, AstraZeneca', 'CFO, Alexion', 'Investment banking, Citi'], key_traits: [{ name: 'Efficiency-minded', summary: 'Confirmed MFN pricing effects are built into guidance — cost discipline is front of mind.' }], sales_do: ['Frame Company work in efficiency and governed-cost terms.'], sales_dont: ['Don\'t pitch scope expansion without an efficiency narrative.'], indegene_selling_point: 'Governed, audit-ready delivery reduces total cost of regulatory and content operations amid MFN pressure.', why_it_matters: 'MFN pricing is already modelled in guidance — vendor spend now faces CFO-level efficiency scrutiny.', nba_outcome: 'Sarin approves a governed-cost workstream with an efficiency case attached to the China or oncology regulatory workload.' },
    { id: 'az-duran', account_id: 'astrazeneca', name: 'Cristina Durán', title: 'President, Evinova (Chief Digital Health Officer)', relationship: 'WhiteSpace', company_role: 'Leads the standalone Evinova digital-health subsidiary and its Accenture/AWS distribution partnerships.', career_history: ['President, Evinova', 'Chief Digital Health Officer, AstraZeneca R&D'], key_traits: [{ name: 'Partnership-oriented', summary: 'Comfortable moving fast on external technology partnerships.' }], sales_do: ['Enter via a specific adjacent-to-regulatory digital-health use case.'], sales_dont: ['Don\'t position as a generic SI competing with Accenture head-on.'], indegene_selling_point: 'Regulatory-and-content interoperability that complements, rather than duplicates, the Evinova platform stack.', why_it_matters: 'Evinova\'s Accenture/AWS partnership proves AstraZeneca moves fast on external technology — the same speed applies to regulatory-adjacent partners.', nba_outcome: 'Durán co-sponsors a regulatory-adjacent digital-health use case that complements Evinova rather than competes with Accenture.' },
    { id: 'az-jones', account_id: 'astrazeneca', name: 'Elaine Jones', title: 'VP, Global Regulatory Affairs', relationship: 'Warm', company_role: 'Senior regulatory-affairs leader; a plausible first warm entry point for the China and oncology submission workload.', career_history: ['VP Global Regulatory Affairs, AstraZeneca', 'Regulatory lead, prior big-pharma'], key_traits: [{ name: 'Operationally pragmatic', summary: 'Responsive to concrete capacity and timeline relief.' }], sales_do: ['Lead with dossier-localisation capacity and CMC variation support for China.'], sales_dont: ['Don\'t over-index on technology before the operational relationship exists.'], indegene_selling_point: 'Immediate, scalable China regulatory-operations capacity at the moment of maximum relevance.', why_it_matters: 'China submission volume is surging now — and this Warm relationship is Company\'s only confirmed open door at AstraZeneca.', nba_outcome: 'A scoped China dossier-localisation and CMC variation pilot with Jones — a first paid engagement that opens the Oncology and Enhertu follow-ons.' },
  ],
  org: [
    { id: 'az-soriot', name: 'Sir Pascal Soriot', title: 'CEO', parent_id: null, relationship: 'Cold' },
    { id: 'az-sarin', name: 'Aradhana Sarin', title: 'CFO', parent_id: 'az-soriot', relationship: 'Cold' },
    { id: 'az-duran', name: 'Cristina Durán', title: 'President, Evinova', parent_id: 'az-soriot', relationship: 'WhiteSpace' },
    { id: 'az-jones', name: 'Elaine Jones', title: 'VP, Global Regulatory Affairs', parent_id: 'az-sarin', relationship: 'Warm' },
  ],
  plan: [
    { section_key: 'account-strategy', title: 'Account Strategy', content: 'Establish a China regulatory-operations beachhead, then expand into oncology submission scale and the technology track before SI-led automation forecloses it.' },
    { section_key: 'target-opportunities', title: 'Target Opportunities', content: 'China NMPA expansion ($2.4M ACV), Imfinzi GEJ omnichannel launch support ($1.8M ACV), Alexion migration follow-on.' },
    { section_key: 'relationship-plan', title: 'Relationship Plan', content: 'Route to Soriot through Elaine Jones (regulatory) and the China regulatory leads; open a digital-health thread via Cristina Durán.' },
  ],
}

function coreDossier(o: {
  account_id: string; summary: string; priorities: string[]; bets: { title: string; body: string }[];
  rtw: string[]; nba: string[]; org: string; competitive: string; delivery: string; risks: string; exec: string;
  execs: AccountExec[]; orgPeople: OrgPerson[]; plan: AccountPlanSection[]
}): AccountDossier {
  return {
    account_id: o.account_id,
    one_minute_summary: o.summary,
    emerging_priorities: o.priorities,
    big_bets: o.bets,
    right_to_win: o.rtw,
    next_best_actions: o.nba,
    sections: sections({
      context: o.summary, org: o.org, priorities: o.priorities.join(' '), buyer: 'Buyer coverage in build-out; core relationships being established.',
      competitive: o.competitive, delivery: o.delivery, growth: o.rtw.join(' '), risks: o.risks, exec: o.exec,
      notes: 'Core demo account — full cross-module depth.',
    }),
    execs: o.execs, org: o.orgPeople, plan: o.plan,
  }
}

const GSK = coreDossier({
  account_id: 'gsk',
  summary: 'GSK is a global vaccines and specialty-medicines leader expanding its MedComm and MLR footprint. Scrutiny centres on content supply-chain cycle times and compliance throughput. For Company, the value case is an integrated content-plus-compliance proposition anchored on the Shingrix comorbid strategy and the ViiV long-acting HIV portfolio.',
  priorities: ['Expand the Shingrix comorbid-population commercial strategy.', 'Scale ViiV long-acting HIV regimen medical content.', 'Improve content supply-chain cycle time and MLR throughput.', 'Modernise the US commercial data platform.'],
  bets: [
    { title: 'Vaccines commercial scale', body: 'Shingrix comorbid targeting expands segmented omnichannel and medical-analytics content demand.' },
    { title: 'Governed AI content', body: 'ViiV AI-assisted content needs a formalised governed-review workflow — a Company MLR + MedComm wedge.' },
  ],
  rtw: ['Integrated content-plus-compliance operations depth.', 'Governed-AI MLR review benchmarks vs point-solution competitors.'],
  nba: ['Publish governed-AI MLR review benchmarks for the ViiV workstream.', 'Scope the Shingrix comorbid omnichannel + analytics pursuit.'],
  org: 'CSO Tony Wood leads R&D; vaccines and specialty BUs drive commercial content demand.',
  competitive: 'EVERSANA marketing AI-assisted MLR; Fishawack strong in MedComm; ZS in analytics.',
  delivery: '2 Critical (Shingrix comorbid omnichannel, Vaccines BU data foundation), 2 Needs-attention (ViiV content workflow, general-medicines refresh), 2 Stable.',
  risks: 'AI-content review governance gap; reconciliation-process debt in the vaccines data foundation.',
  exec: 'Tony Wood: data-strategy entry; vaccines commercial leads: content-supply proof points.',
  execs: [
    { id: 'gsk-wood', account_id: 'gsk', name: 'Tony Wood', title: 'Chief Scientific Officer', relationship: 'Warm', company_role: 'Drives R&D strategy across vaccines and specialty medicines.', career_history: ['CSO, GSK', 'SVP Medicine Design, Pfizer'], key_traits: [{ name: 'Science-led', summary: 'Values scientific-narrative rigour in content.' }], sales_do: ['Lead with governed scientific-content quality and speed.'], sales_dont: ['Don\'t pitch pure creative without scientific depth.'], indegene_selling_point: 'Scientific-content depth plus governed-AI review speed in one integrated operation.', why_it_matters: 'GSK\'s science-led culture rewards content rigour — speed without scientific depth loses the conversation.', nba_outcome: 'A governed-AI review pilot on a vaccine or specialty launch campaign, endorsed by Wood for the wider R&D content teams.' },
  ],
  orgPeople: [
    { id: 'gsk-emma', name: 'Emma Walmsley', title: 'CEO', parent_id: null, relationship: 'Cold' },
    { id: 'gsk-wood', name: 'Tony Wood', title: 'CSO', parent_id: 'gsk-emma', relationship: 'Warm' },
    { id: 'gsk-vax', name: 'VP, Vaccines Commercial', title: 'VP Vaccines Commercial', parent_id: 'gsk-emma', relationship: 'Champion' },
  ],
  plan: [
    { section_key: 'account-strategy', title: 'Account Strategy', content: 'Anchor on Shingrix comorbid and ViiV content, then expand into MLR acceleration and data-platform modernisation.' },
    { section_key: 'target-opportunities', title: 'Target Opportunities', content: 'Shingrix comorbid omnichannel + analytics; governed-AI MLR review platform.' },
  ],
})

const JNJ = coreDossier({
  account_id: 'jnj',
  summary: 'Johnson & Johnson is a diversified pharma and MedTech leader investing heavily in enterprise omnichannel and governed commercial AI. The relationship is multi-service with headroom in Regulatory. For Company, the enterprise governed-AI mandate and the ICOTYDE launch are the highest-value near-term wedges.',
  priorities: ['Operationalise the enterprise governed-AI mandate across commercial.', 'Execute the ICOTYDE launch field enablement at scale.', 'Advance Tremfya immunology and growth-brand labeling.', 'Scale MLR review capacity via platform.'],
  bets: [
    { title: 'Governed commercial AI', body: 'The enterprise AI-governance mandate creates demand for pilot-review governance and DAAI advisory.' },
    { title: 'Launch enablement at scale', body: 'ICOTYDE field enablement demand outpaces production capacity — a launch-critical content wedge.' },
  ],
  rtw: ['Enterprise-grade governed-AI operating model.', 'Scaled launch-enablement production capacity.'],
  nba: ['Formalise the mandatory governance gate for AI pilots.', 'Scale the ICOTYDE enablement production pod.'],
  org: 'EVP Jennifer Taubert leads Innovative Medicine; enterprise AI mandate sponsored at commercial-leadership level.',
  competitive: 'IQVIA and ZS in DAAI; Accenture in platform services.',
  delivery: '2 Critical (ICOTYDE enablement, AI pilot governance), 2 Needs-attention (Tremfya content, growth-brand labeling), 2 Stable.',
  risks: 'Ungoverned AI pilot scaling; label-update timeliness under concurrent updates.',
  exec: 'Taubert: enterprise omnichannel + AI governance; commercial-AI mandate owner: pilot-review governance.',
  execs: [
    { id: 'jnj-taubert', account_id: 'jnj', name: 'Jennifer Taubert', title: 'EVP, Worldwide Chairman, Innovative Medicine', relationship: 'Champion', company_role: 'Leads the Innovative Medicine business with enterprise omnichannel and governed-AI commitments.', career_history: ['EVP, J&J Innovative Medicine', 'Commercial leadership, Merck'], key_traits: [{ name: 'Enterprise operator', summary: 'Thinks in enterprise operating-model terms.' }], sales_do: ['Frame governed AI as an enterprise operating model, not a point tool.'], sales_dont: ['Don\'t propose ungoverned pilot scaling.'], indegene_selling_point: 'An enterprise governed-AI operating model that de-risks commercial AI at scale.', why_it_matters: 'J&J is scaling AI across a $60B Innovative Medicine business — governance is the adoption gate, not the technology.', nba_outcome: 'An enterprise governed-AI framework engagement scoped with Taubert\'s commercial organisation — the strongest relationship in the portfolio.' },
  ],
  orgPeople: [
    { id: 'jnj-taubert', name: 'Jennifer Taubert', title: 'EVP, Innovative Medicine', parent_id: null, relationship: 'Champion' },
    { id: 'jnj-ai', name: 'Commercial AI Mandate Owner', title: 'VP, Commercial AI', parent_id: 'jnj-taubert', relationship: 'Warm' },
  ],
  plan: [
    { section_key: 'account-strategy', title: 'Account Strategy', content: 'Lead with governed-AI operating model and ICOTYDE launch enablement; expand into Regulatory headroom.' },
    { section_key: 'target-opportunities', title: 'Target Opportunities', content: 'Governed-AI advisory + pilot review; MLR review capacity scaling platform.' },
  ],
})

const NVS = coreDossier({
  account_id: 'novartis',
  summary: 'Novartis is a data-first pharma prioritising DAAI and omnichannel personalisation, with active content-production and video RFPs and margin pressure on delivery. A live Veeva Vault CRM migration is a time-boxed Tech Solutions opportunity. Entresto lifecycle defense is the most time-critical delivery workstream.',
  priorities: ['Complete the Veeva Vault CRM migration on schedule.', 'Defend Entresto through lifecycle/LOE pressure.', 'Advance Kisqali oncology and Cosentyx line extensions.', 'Enable Leqvio and Pluvicto field/site ramps.'],
  bets: [
    { title: 'CRM modernisation window', body: 'The Vault CRM migration is a budgeted, time-boxed Tech Solutions surge — scope readiness before the window closes.' },
    { title: 'Lifecycle brand defense', body: 'Entresto defense content is time-critical against LOE pressure — a concentrated delivery + compliance need.' },
  ],
  rtw: ['Migration-readiness and integration depth for Vault CRM.', 'Concentrated brand-defense delivery capacity.'],
  nba: ['Scope Vault CRM migration readiness before H2 2026.', 'Stand up a dedicated Entresto brand-defense pod.'],
  org: 'US President Victor Bultó drives a data-first commercial agenda and CRM modernisation.',
  competitive: 'Veeva, Accenture and Cognizant in migration services; Axtria in field analytics.',
  delivery: '2 Critical (Entresto defense, CRM governance advisory), 2 Needs-attention (Kisqali content, Leqvio enablement), 2 Stable.',
  risks: 'CRM evaluation timeline dependency; competitive-claim compliance rework.',
  exec: 'Bultó: US data-first commercial + CRM; brand teams: lifecycle-defense proof points.',
  execs: [
    { id: 'nvs-bulto', account_id: 'novartis', name: 'Victor Bultó', title: 'President, US', relationship: 'Warm', company_role: 'Leads the US business with a data-first commercial agenda and active CRM modernisation.', career_history: ['President US, Novartis', 'Country lead, Novartis Spain'], key_traits: [{ name: 'Data-first', summary: 'Prioritises data-enabled commercial decisions.' }], sales_do: ['Lead with migration-readiness and data-governance depth.'], sales_dont: ['Don\'t ignore the margin-pressure context.'], indegene_selling_point: 'Migration-readiness plus data-governance advisory that de-risks the Vault CRM transition.', why_it_matters: 'US margin pressure makes the Vault CRM migration a visible, budget-justified program — readiness decides whether it slips.', nba_outcome: 'A migration-readiness assessment signed with the US commercial team, converting the Warm relationship into a named program.' },
  ],
  orgPeople: [
    { id: 'nvs-narasimhan', name: 'Vas Narasimhan', title: 'CEO', parent_id: null, relationship: 'Cold' },
    { id: 'nvs-bulto', name: 'Victor Bultó', title: 'President, US', parent_id: 'nvs-narasimhan', relationship: 'Warm' },
  ],
  plan: [
    { section_key: 'account-strategy', title: 'Account Strategy', content: 'Win the Vault CRM migration window, then expand into data-governance advisory and lifecycle-defense delivery.' },
    { section_key: 'target-opportunities', title: 'Target Opportunities', content: 'Veeva Vault CRM migration services; Entresto lifecycle brand-defense program.' },
  ],
})

const SNF = coreDossier({
  account_id: 'sanofi',
  summary: 'Sanofi is an immunology and vaccines leader whose "Play to Win" efficiency mandate is driving vendor rationalisation — an opening for an integrated MedComm + Omnichannel single-partner proposition. Dupixent new-indication patient services and field AI adoption are the highest-value near-term workstreams.',
  priorities: ['Advance Dupixent into new indications with patient-services content.', 'Drive field AI adoption via change management.', 'Rationalise vendors under "Play to Win".', 'Refresh the vaccines franchise content.'],
  bets: [
    { title: 'Vendor consolidation opening', body: '"Play to Win" rationalisation favours an integrated single-partner MedComm + Omnichannel proposition that reduces Sanofi\'s vendor count.' },
    { title: 'Field AI adoption', body: 'Stalled field AI adoption needs a structured change-management intervention — a people-side DAAI wedge.' },
  ],
  rtw: ['Integrated single-partner content operations.', 'Field change-management + AI-adoption capability.'],
  nba: ['Pitch integrated MedComm + Omnichannel consolidation.', 'Launch a structured field AI-adoption coaching programme.'],
  org: 'CMDO Julie Van Ongevalle leads the "Play to Win" digital and omnichannel agenda.',
  competitive: 'Publicis and Real Chemistry in omnichannel; EVERSANA in MLR.',
  delivery: '2 Critical (Dupixent patient services, field AI adoption), 2 Needs-attention (med-info desk, vaccines refresh), 2 Stable.',
  risks: 'Field-adoption change gap; messaging-guidance dependency on brand teams.',
  exec: 'Van Ongevalle: digital/omnichannel + AI adoption; brand teams: franchise messaging.',
  execs: [
    { id: 'snf-julie', account_id: 'sanofi', name: 'Julie Van Ongevalle', title: 'EVP, Chief Marketing & Digital Officer', relationship: 'Warm', company_role: 'Leads the "Play to Win" digital and omnichannel agenda, prioritising field AI adoption and vendor rationalisation.', career_history: ['CMDO, Sanofi', 'Brand leadership, Estée Lauder'], key_traits: [{ name: 'Efficiency-driven', summary: 'Rationalising vendors toward integrated partners.' }], sales_do: ['Pitch an integrated single-partner model that reduces vendor count.'], sales_dont: ['Don\'t propose another point solution.'], indegene_selling_point: 'A single integrated MedComm + Omnichannel partner that reduces vendor sprawl and accelerates field AI adoption.', why_it_matters: 'Sanofi is rationalising vendors toward integrated partners — being the consolidated answer is the entry, not a pitch.', nba_outcome: 'Sanofi names Company a preferred integrated partner in a first consolidated MedComm + Omnichannel engagement.' },
  ],
  orgPeople: [
    { id: 'snf-hudson', name: 'Paul Hudson', title: 'CEO', parent_id: null, relationship: 'Cold' },
    { id: 'snf-julie', name: 'Julie Van Ongevalle', title: 'EVP CMDO', parent_id: 'snf-hudson', relationship: 'Warm' },
  ],
  plan: [
    { section_key: 'account-strategy', title: 'Account Strategy', content: 'Use the "Play to Win" consolidation opening to win an integrated MedComm + Omnichannel mandate; expand via field AI adoption.' },
    { section_key: 'target-opportunities', title: 'Target Opportunities', content: 'Integrated MedComm + Omnichannel consolidation; field AI adoption change-management.' },
  ],
})

export const DOSSIERS: AccountDossier[] = [AZ, GSK, JNJ, NVS, SNF]
export const dossierForAccount = (accountId: string) => DOSSIERS.find(d => d.account_id === accountId)
export const ALL_EXECS: AccountExec[] = DOSSIERS.flatMap(d => d.execs)
export const execById = (id: string) => ALL_EXECS.find(e => e.id === id)

export const RELATIONSHIP_META: Record<AccountExec['relationship'], { label: string; color: string; bg: string }> = {
  Champion:   { label: 'Champion',    color: 'var(--emerald)', bg: 'var(--emerald-bg)' },
  Warm:       { label: 'Warm',        color: 'var(--amber)',   bg: 'var(--amber-bg)' },
  Cold:       { label: 'Cold',        color: 'var(--red)',     bg: 'var(--red-bg)' },
  WhiteSpace: { label: 'White Space', color: 'var(--text-3)',  bg: 'var(--navy-faint)' },
}
