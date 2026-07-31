// ─── Humantic News Signals (external) ─────────────────────────────────────────
// Sourced from "Humantic News Signals" (curated account signals, Jul 2026).
// Of the five Sales & Growth accounts, the export covers Sanofi and J&J.
// Merged into NEWS_EXTERNAL_BY_ACCOUNT so they surface in External News + the
// account dossier's News Intelligence section.

export interface HumanticSignal {
  id: string; title: string; date: string; score: number; featured?: boolean
  body: string; suggestedAction: string; sources: string[]
}

export const HUMANTIC_NEWS: Record<string, HumanticSignal[]> = {
  sanofi: [
    {
      id: 'sny-h1', title: 'Paulo Fontoura promoted to Global R&D Head', date: 'Jul 2026', score: 9, featured: true,
      body: "Sanofi appointed Paulo Fontoura as Executive VP and Global Head of Pharmaceutical R&D on 2026-07-15; he now directs pharmaceutical R&D strategy and operations, making him the primary sponsor for Company's intelligent R&D operations and AI-driven research orchestration.",
      suggestedAction: "Send a congratulatory note to Paulo and request a 20–30 minute briefing to discuss how Company's intelligent R&D operations and secure AI can accelerate Sanofi's pharmaceutical R&D priorities.",
      sources: ['Sanofi Appoints Paulo Fontoura as Global Head of Pharmaceutical R&D (ideal-investisseur.fr)'],
    },
    {
      id: 'sny-h2', title: 'Sanofi sues Moderna, Pfizer over mRNA vaccine patents', date: 'Jul 2026', score: 7,
      body: "Sanofi filed lawsuits against Moderna and Pfizer seeking mRNA vaccine patent royalties (2026-07-15); this raises IP, licensing and regulatory demands where Company's R&D intelligence, compliance workflows, and data governance could assist.",
      suggestedAction: "Propose a short briefing with Sanofi's legal or regulatory leads to outline how Company's IP-analytics, R&D intelligence, and secure data governance can support licensing and litigation-related data needs.",
      sources: ['Sanofi Sues Moderna, Pfizer for Vaccine-Tech Patent Royalties', 'Sanofi opens new chapters in Pfizer, Moderna mRNA patent litigation sagas | Fierce Pharma'],
    },
  ],
  jnj: [
    {
      id: 'jnj-h1', title: 'J&J raises 2026 outlook on strong Q2; TREMFYA approval highlighted', date: 'Jul 2026', score: 9, featured: true,
      body: "J&J reported stronger-than-expected Q2 2026 results and raised 2026 guidance, and filed an 8-K on 2026-07-15; the release highlights TREMFYA approval. Improved outlook and active immunology regulatory/commercial work increase near-term demand for commercialization, regulatory, medical-affairs, and launch-readiness support.",
      suggestedAction: "Send a brief congratulatory email to Innovative Medicine leaders referencing the raised 2026 guidance and TREMFYA approval, and propose a 20-minute call to discuss Company's regulatory, medical-affairs, and launch-readiness services for upcoming immunology opportunities.",
      sources: ['Johnson & Johnson reports Q2 2026 results, raises 2026 outlook (jnj.com)', 'jnj-20260715 (sec.gov)'],
    },
  ],
}
