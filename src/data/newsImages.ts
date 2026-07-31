// Topic-matched imagery for news cards. Each topic maps to SEVERAL images and the
// specific item picks one deterministically by id-hash, so two stories about the
// same theme don't show the identical picture. Broken URLs hide via onError.

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`

// Fifteen known-good stable Unsplash IDs (each verified by eye — no mismatched
// or branded imagery, e.g. the old "vaccine" slot was a blood-pressure cuff).
const I = {
  factory: u('photo-1581091226825-a6a2a5aee158'), ai: u('photo-1518186285589-2f7649de83e0'),
  molecule: u('photo-1643780668909-580822430155'), lab: u('photo-1579154204601-01588f351e67'),
  leadership: u('photo-1600880292203-757bb62b4baf'), finance: u('photo-1611974789855-9c2a0a7236a3'),
  vaccine: u('photo-1584036561566-baf8f5f1b144'), deal: u('photo-1521791136064-7986c2920216'),
  city: u('photo-1486406146926-c627a92ad1ab'), award: u('photo-1552664730-d307ca884978'),
  pills: u('photo-1584308666744-24d5c474f2ae'), data: u('photo-1551288049-bebda4e38f71'),
  globe: u('photo-1451187580459-43490279c0fa'), docs: u('photo-1450101499163-c8848c66ca85'),
}
// Each topic gets a distinct trio, spread across the 14-image set so no single
// image dominates (previously I.data alone covered 6 of 11 topics — the main
// cause of visible repetition). Same-theme stories still vary by id-hash.
const POOLS: Record<string, string[]> = {
  vaccine:     [I.vaccine, I.pills, I.lab],
  manufacture: [I.factory, I.city, I.globe],
  ai:          [I.ai, I.data, I.molecule],
  leadership:  [I.leadership, I.deal, I.award],
  finance:     [I.finance, I.deal, I.data],
  deal:        [I.deal, I.leadership, I.finance],
  award:       [I.award, I.leadership, I.finance],
  molecule:    [I.molecule, I.lab, I.pills],
  data:        [I.data, I.ai, I.finance],
  global:      [I.globe, I.city, I.factory],
  regulatory:  [I.docs, I.lab, I.molecule],
}

const FALLBACK = [I.molecule, I.data, I.city, I.lab, I.pills, I.leadership, I.globe, I.docs]

const RULES: [RegExp, string][] = [
  [/vaccine|shingrix|shingles|beyfortus|arexvy|qdenga|flu|immuni/i, 'vaccine'],
  [/china|expansion|manufactur|build-?out|capacity|facility|plant|site|reshor/i, 'manufacture'],
  [/\bai\b|genai|digital|evinova|platform|agentic|automation|cloud|technology|intelligence/i, 'ai'],
  [/ceo|appoint|leadership|promot|executive|chair|president|cfo|cdo|cto|hire|transition/i, 'leadership'],
  [/revenue|financial|earnings|\bq[1-4]\b|guidance|pricing|mfn|reporting|sales|cost/i, 'finance'],
  [/partnership|deal|co-?market|acqui|licens|collaborat|alliance|joint/i, 'deal'],
  [/award|leader|recognit|peak matrix|everest|forrester|idc|index/i, 'award'],
  [/regulatory|submission|ectd|nmpa|ema|fda|pmda|labeling|pharmacovigilance|compliance/i, 'regulatory'],
  [/data|analytics|real-?world|rwd|evidence/i, 'data'],
  [/oncology|cancer|imfinzi|enhertu|adc|camizestrant|darzalex|dupixent|trial|indication|pipeline|molecule|therap/i, 'molecule'],
  [/global|market|apac|emea|region|world/i, 'global'],
]

const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

/** Deterministic, topic-matched image — varied within a topic by id-hash. */
export function newsImageFor(item: { id?: string; title?: string; body?: string }): string {
  const text = `${item.title || ''} ${item.body || ''}`
  const h = hash(item.id || item.title || 'x')
  for (const [re, topic] of RULES) {
    if (re.test(text)) {
      const pool = POOLS[topic] || FALLBACK
      return pool[h % pool.length]
    }
  }
  return FALLBACK[h % FALLBACK.length]
}
