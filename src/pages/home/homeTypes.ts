import type { EvidenceItem } from '../../lib/orgIntelligence'

/** Every band opens evidence through this one callback: HOME's only write path into the drawer stack. */
export type OpenEvidence = (eyebrow: string, title: string, items: EvidenceItem[], emptyLabel?: string) => void
