// Professional headshot photos for executives / power-centre contacts.
// Curated, hand-verified set of formal business portraits from Unsplash (suit/
// blazer, adults only — no children, no casual/free-styled shots). Each person
// gets a UNIQUE photo (no repeats WITHIN or ACROSS accounts) via a deterministic
// per-gender registry. "TBD"/unidentified placeholders get no photo (initials).
import { ALL_EXECS, ORG_BY_ACCOUNT, ACCOUNT_PLAN } from '../data/growthIndex'

// Verified formal male headshots (Unsplash photo IDs).
const MALE_IDS = [
  '1560250097-0b93528c311a', '1500648767791-00dcc994a43e', '1519085360753-af0119f7cbe7',
  '1543132220-3ec99c6094dc', '1676989880361-091e12efc056', '1652471943570-f3590a4e52ed',
  '1718209881007-c0ecdfc00f9d', '1590873803005-539ede4d828a', '1624797432677-6f803a98acb3',
  '1556474835-b0f3ac40d4d1', '1614023342667-6f060e9d1e04', '1642257859842-c95f9fa8121d',
  '1718209881006-f6e313e2e109', '1600878459138-e1123b37cb30', '1544717297-fa95b6ee9643',
  '1657727534530-fcb5d2002c2a', '1554774853-719586f82d77', '1713946598467-fcf9332c56ea',
  '1642522029686-5485ea7e6042', '1687934386408-ba56a7dce844', '1713946598186-8e28275719b9',
  '1675869940341-d495d49010b5', '1526948128573-703ee1aeb6fa', '1584940120505-117038d90b05',
  '1784755105245-adb6cc5c112e', '1584940121819-1883a5d3b0bd', '1778692258270-bc0e80e975c0',
  '1780733058106-1126f2c42c0d', '1584554376766-ac0f2c65e949', '1780733058018-d1219383e97a',
  '1584940121730-93ffb8aa88b0', '1737574821698-862e77f044c1', '1771898343647-bd979ad8cca5',
  '1780733062101-3831bb673f22', '1780733057909-e40d3f4c8cbe', '1758518729314-b02874db8c37',
]
// Verified formal female headshots (Unsplash photo IDs).
const FEMALE_IDS = [
  '1573496359142-b8d87734a5a2', '1573497019940-1c28c88b4f3e', '1506863530036-1efeddceb993',
  '1573497019236-17f8177b81e8', '1494790108377-be9c29b29330', '1581065178047-8ee15951ede6',
  '1701096374092-bb70915fdc5c', '1607990283143-e81e7a2c9349', '1701096351544-7de3c7fa0272',
  '1582896911227-c966f6e7fb93', '1607746882042-944635dfe10e', '1614786269829-d24616faf56d',
  '1609436132311-e4b0c9370469', '1630939687530-241d630735df', '1762341104634-998bbee0ccba',
  '1780733058439-b8952315e59c', '1699899657680-421c2c2d5064', '1585240975858-7264fd020798',
  '1573497161161-c3e73707e25c', '1604904612715-47bf9d9bc670',
]

const FEMALE_NAMES = new Set([
  'aradhana', 'cristina', 'elaine', 'jennifer', 'julie', 'priya', 'meera', 'devika',
  'fatima', 'anna', 'erica', 'susan', 'kate', 'artee', 'belen', 'belén', 'maria',
  'emma', 'sarah', 'lisa', 'karen', 'laura', 'rachel', 'michelle', 'nancy', 'diane',
  'helen', 'catherine', 'victoria', 'sandra', 'teresa', 'angela', 'claire', 'sophie',
  'marie', 'isabelle', 'nicole', 'christine', 'deborah', 'patricia', 'linda', 'barbara',
  'jessica', 'ashley', 'amanda', 'melissa', 'stephanie', 'rebecca', 'sharon', 'cynthia',
  'kathleen', 'amy', 'anne', 'joyce', 'judith', 'gloria', 'ruth', 'joan', 'grace',
  'natalie', 'olivia', 'sophia', 'ava', 'mia', 'chloe', 'hannah', 'aisha', 'mei', 'yuki',
])

const firstName = (n: string) => (n || '').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-zà-ÿ]/g, '')
export const isTBD = (n: string) => /\bTBD\b|\(TBD\)|to be (?:named|identified)|unidentified|lead\)$/i.test(n || '')
export const isFemaleName = (n: string) => FEMALE_NAMES.has(firstName(n))
export const initialsOf = (n: string) => (n || '?').split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase()

// Build a stable registry so a given person always maps to the same unique photo.
// UNIQUENESS: photos are handed out sequentially per gender and NEVER reused — no
// two people (within OR across accounts) share a photo, up to each gender pool's
// size. Names unknown at build time (research execs, synthetic pads) get the next
// free photo on first request, memoised for stability.
const reg = new Map<string, { url: string | null }>()
const usedM = new Set<number>()
const usedW = new Set<number>()
let mCursor = 0, wCursor = 0
const photoUrl = (id: string) => `https://images.unsplash.com/photo-${id}?w=240&h=240&fit=crop&crop=faces&q=75`
function claim(female: boolean): string {
  const pool = female ? FEMALE_IDS : MALE_IDS
  const used = female ? usedW : usedM
  let cur = female ? wCursor : mCursor
  while (used.has(cur % pool.length) && used.size < pool.length) cur++
  const idx = cur % pool.length
  used.add(idx)
  if (female) wCursor = cur + 1; else mCursor = cur + 1
  return photoUrl(pool[idx])
}
;(function build() {
  const names: string[] = []
  const push = (n?: string) => { if (n && !names.includes(n)) names.push(n) }
  ;(ALL_EXECS || []).forEach((e: any) => push(e?.name))
  Object.values(ORG_BY_ACCOUNT || {}).forEach((arr: any) => (arr || []).forEach((p: any) => push(p?.name)))
  Object.values(ACCOUNT_PLAN || {}).forEach((pl: any) => (pl?.powerCentres || []).forEach((p: any) => push(p?.name)))
  names.sort()
  names.forEach(n => {
    reg.set(n, { url: isTBD(n) ? null : claim(isFemaleName(n)) })
  })
})()

export function avatarUrl(name: string): string | null {
  if (!name || isTBD(name)) return null
  let r = reg.get(name)
  if (!r) {
    // Unknown name: assign the next free unique portrait and remember it.
    r = { url: claim(isFemaleName(name)) }
    reg.set(name, r)
  }
  return r.url
}
