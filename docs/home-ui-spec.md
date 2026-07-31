# Home Page — Information Architecture Specification

**Surface:** Organization-level HOME (new). Sits above MODULES and ACCOUNTS.
**Primary reader:** CEO / CXO of Indegene commercialization leadership.
**Design mandate:** Situation understood in **seconds**, evidence reachable in **one click**.
**Data source:** org rollup computed from `research/{astrazeneca,gsk,jnj,sanofi,novartis}/{signals,opportunities,executives,quarters}.json`.
**Constraint:** NOT a KPI dashboard. No tile wall of context-free numbers. Every number carries a trend, a cause, and a next move.

---

## 0. Reading model — the 7-second contract

A CXO scans **top-to-bottom in one column of decreasing altitude**. Each band answers one question, then invites a drill.

| Scan second | Band | Question answered |
|---|---|---|
| 0–2s | **Executive Heads-Up** | "What must I know right now?" |
| 2–4s | **Portfolio Health Matrix** | "Which accounts are safe / at risk?" |
| 4–6s | **Opportunity ↔ Risk balance** | "Where is money moving toward or away from us?" |
| 6–7s | **Next Best Actions** | "What do I / my team do next?" |
| on demand | **Signal Timeline, Exec Contacts, Evidence Drawers** | "Prove it / who do I call?" |

Rule: **nothing below the fold is required to grasp the situation.** Below-fold = evidence and act, not comprehension.

---

## 1. Anti-pattern guardrails (what this page is NOT)

- ✗ No row of 6 metric cards with a big number + tiny % and nothing else.
- ✗ No gauge/speedometer, no donut of revenue mix, no dual-axis chart.
- ✗ No color-only status (every RAG state ships **dot + label + icon**).
- ✗ No chart without an inner hover/click payload (see §9 — universal law).
- ✓ Every visual is an **entry point to evidence**, never a terminal decoration.

---

## 2. Section hierarchy (priority order = DOM order = visual weight)

```
┌─ HOME ────────────────────────────────────────────────┐
│ 1  EXECUTIVE HEADS-UP           (hero band, 1 screen)  │  ← highest priority
│ 2  PORTFOLIO HEALTH MATRIX      (account × dimension)  │
│ 3  OPPORTUNITY / MISSED-OPP     (slope + balance)      │
│ 4  NEXT BEST ACTIONS            (ranked action cards)  │
│ 5  ORG SIGNAL TIMELINE          (chronological)        │
│ 6  QUARTERLY TREND STRIP        (3Q line, per account) │
│ 7  EXECUTIVE CONTACTS           (engage rail)          │  ← lowest, on-demand
└───────────────────────────────────────────────────────┘
   ▸ EVIDENCE DRAWER  (right-side overlay, invoked from anywhere)
```

Weight ladder: band 1 gets ~40% of first viewport, full-bleed. Bands 2–4 are equal-weight cards. Bands 5–7 are quieter, denser, muted surfaces.

---

## 3. Band 1 — Executive Heads-Up (the hero)

**Job:** one glance replaces reading five account reports.

**Composition — three stacked elements, no chart:**

1. **Situation line** — a single generated sentence in Playfair (reserved serif, exec-briefing register):
   *"5 accounts tracked · 3 healthy, 2 pressured · 14 high-urgency opportunities open · 6 windows closing this quarter."*
   Numbers inside are **click targets** that scroll-spy to their band.

2. **Heads-Up chips (max 4)** — the machine-selected most-material items across ALL accounts, ranked by `urgency=High × confidence × opportunity_or_risk`. Each chip:
   - left: status icon + account wordmark
   - body: `title` (from signal/opportunity)
   - right: urgency pill
   - **click → Evidence Drawer** for that item (§9).
   - Selection rule: pull top-N where `urgency:"High"`; break ties by `confidence:"High"` then risk-before-opportunity (a closing risk outranks an open opportunity of equal urgency).

3. **Balance ribbon** — one horizontal 100%-width **diverging bar**, no axis:
   left pole (amber→red) = count of open **risks / missed opportunities**, right pole (teal→emerald) = **opportunities**. Neutral gray seam at center.
   - Encodes org-wide posture in one mark. Hover any segment → tooltip "8 opportunities · 4 High urgency"; click → filters bands 2–5 to that polarity.

**Progressive disclosure:** chips show title only; cause/evidence/NBA live in the drawer. Nothing here scrolls.

---

## 4. Band 2 — Portfolio Health Matrix  *(Matrix)*

**Job:** "which accounts are safe, which are pressured, and why."

**Form:** account (row) × intelligence dimension (column) **matrix of status cells** — NOT a heatmap of one metric. Dimensions derived from each account's artifacts:

| | Financial | Growth | Competitive | Regulatory | Risk |
|---|---|---|---|---|---|
| AstraZeneca | ● | ● | ● | ● | ● |
| GSK | ● | ● | ● | ● | ● |
| J&J | … | | | | |
| Sanofi | … | | | | |
| Novartis | … | | | | |

- **Cell encoding:** status color (emerald/amber/red, fixed semantic palette) + **glyph** (▲ improving / ▬ steady / ▼ deteriorating) so it survives colorblind + grayscale. Cell value = worst-of / net-of the signals in that `*_signals` category for the account.
- **Row cap** = per-account overall posture badge (mirrors ACCOUNTS module posture).
- **Column header hover** = definition of the dimension + how it's scored.

**Interaction:**
- **Hover cell** → mini-popover: count of signals, top signal `title`, confidence.
- **Click cell** → Evidence Drawer scoped to that account × dimension (lists those signals with WHAT/EVIDENCE/SO-WHAT).
- **Click row label** → deep-link to that account in the ACCOUNTS view.
- Matrix is the page's **cross-filter controller**: selecting a row dims bands 3–5 to that account.

**Progressive disclosure:** matrix shows state only → popover shows summary → drawer shows evidence. Three tiers, one cell.

---

## 5. Band 3 — Opportunity / Missed-Opportunity  *(Slope + QoQ)*

**Job:** "where is value accruing to us vs. slipping away."

Two coupled visuals, side by side:

**5a. Momentum slope (QoQ change)** — a **slope graph**: left tick = prior-quarter posture, right tick = current, one line per account. Rising slope = improving commercial opening; falling = eroding. Slope, not bar, because the *direction and crossing* is the message, not the magnitude.
- Line color follows the **entity (account), fixed order, never repainted** on filter.
- **Hover a slope** → tooltip: the QoQ delta + the driver signal (`title`). **Click** → drawer with the quarter-over-quarter evidence from `quarters.json`.

**5b. Opportunity ledger** — two short **ranked lists** under a shared header, fed by `opportunities[]` and `potential_missed_opportunities[]` across accounts:
- **Open opportunities** (teal accent) — sorted urgency→confidence.
- **Closing / missed** (amber accent) — the `potential_missed_opportunities`, each with a **"why now" expiry hint** (e.g. PDUFA date, competitor move).
- Each row: account chip · title · urgency pill · **click → drawer**.
- Missed-opp rows carry a distinct left-border texture (45° hatch) so risk reads even in grayscale.

**Progressive disclosure:** list shows title + urgency; the full WHAT→WHY-NOW→WHO chain opens in drawer.

---

## 6. Band 4 — Next Best Actions  *(Ranked action cards)*

**Job:** convert intelligence into assignable moves.

**Form:** vertical stack of **ranked NBA cards** (not a table). Source: `next_best_action` fields promoted org-wide, ranked by `urgency × confidence × value-of-linked-opportunity`. Show top 5, "show all" expands.

**Each card:**
- **Rank number** (1..n) — establishes priority at a glance.
- **Action** = the `next_best_action` sentence.
- **Because** = one-line `so_what` (the trigger).
- Meta row: account chip · service-line tag (DAAI/MedComm/MLR/Omnichannel/Regulatory/Tech) · urgency pill · confidence.
- **Who** = linked executive/target-function avatar (from `executives.json`) → hover shows name+role, click opens Exec Contact (§8).
- Actions: **[Open evidence]** (drawer) · **[Promote to initiative]** (writes to shared `initiatives` store, same mechanism MODULES uses).

**Progressive disclosure:** card face = action + because + who. Full signal lineage + source links = drawer. This is the only band with a write-action (promote).

---

## 7. Band 5 — Org Signal Timeline  *(Timeline)*

**Job:** "what has been happening across the portfolio, newest first."

**Form:** single vertical **chronological timeline**, all accounts merged, most-recent at top. Each node = one signal.
- Node marker color = signal category status; node icon = opportunity/risk/both.
- Row: date · account chip · `title` · category tag.
- **Filter row (one line, above timeline):** account · category · urgency · polarity. Filters are shared with the matrix cross-filter.
- **Hover node** → tooltip with `evidence` (the fact line). **Click node** → Evidence Drawer.
- Dense, muted surface — this is the "prove the story" layer, not the headline.

**Progressive disclosure:** collapsed to ~12 most-recent; "load earlier" reveals the tail.

---

## 8. Band 6 — Quarterly Trend Strip  *(3Q Line)*

**Job:** back the posture with the actual financial trajectory.

**Form:** small-multiples row — one compact **line chart per account**, 3 quarters (FY2025 → Q1 → Q2 2026, from `quarters.json`). Single series each (revenue/sales), so **no legend** — the account name titles the facet.
- One hue, thin 2px line, 4px rounded data-ends, ≥8px end marker with value label on the latest point only.
- **Crosshair + tooltip on hover** (mandatory for line form): quarter · value · growth% · the `ai_hypothesis` trend read.
- **Click a facet** → drawer with that account's full `quarters.json` fact block + guidance.
- Never a dual axis; currencies differ (USD/GBP/EUR) so each facet is self-scaled and labeled — never co-plotted.

**Progressive disclosure:** sparkline-scale by default; click expands to the labeled quarter detail in drawer.

---

## 9. Band 7 — Executive Contacts (engage rail)

**Job:** "who do I call, and are they a live target."

**Form:** compact card rail from `executives.json` (`executives[]` + `target_functions[]`), grouped by engagement `priority`.
- Card: avatar/initials · name (or **role**, when `name:null` — Novartis CEO, honestly labeled) · account · status pill (Active/Incoming/Departed).
- Departures rendered muted/struck (AZ Wang, Haas; Sanofi Hudson) — visible as intel, not as targets.
- **Hover** → `ai_hypothesis` (why they matter now). **Click** → drawer: fact + `indegene_angle` + `engagement_recommendation` + source.
- Target-functions (unnamed buying centers) shown as role cards so the rail never fabricates a name.

**Progressive disclosure:** face = name/role/status; the engagement play opens in drawer.

---

## 10. Evidence Drawer (the universal disclosure surface)

**Invoked from every visual.** Right-side overlay (reuses the MODULES `DetailModal` pattern, gold top-rule), Esc/overlay-close, Back stack for chained drill.

**Contract — every drawer renders the methodology chain, in this fixed order:**
1. **WHAT HAPPENED** (`what_happened`) — fact.
2. **EVIDENCE** (`evidence`) — quoted figure/fact.
3. **AI HYPOTHESIS** (`ai_hypothesis`) — visually flagged as inference, distinct tint, "AI" tag. Never blended with fact.
4. **SO WHAT / WHY IT MATTERS** (`so_what`, `why_it_matters_to_indegene`).
5. **OPPORTUNITY / RISK** (`opportunity_or_risk`) + **WHY NOW** (urgency).
6. **NEXT BEST ACTION** (`next_best_action`) + **WHO** (linked exec).
7. **CONFIDENCE** badge + **SOURCE REFERENCES** (clickable external links).

**FACT / HYPOTHESIS / RECOMMENDATION separation is a visual rule**, not just data: fact = ink on surface, hypothesis = tinted "AI" block, recommendation = gold-accented action block. The three never share a style.

---

## 11. Interaction system (summary)

| Gesture | Result |
|---|---|
| Hover any mark/cell/node | inline tooltip with the payload behind it (never empty) |
| Click any mark/chip/row | Evidence Drawer for that item |
| Select matrix row / balance segment / filter | cross-filters bands 3–5 (color-by-entity preserved, survivors never repainted) |
| Promote (NBA card only) | writes to shared `initiatives` |
| Back (in drawer) | pops chained drill without losing scroll position |

**Universal law:** *every visual representation has hoverable OR clickable inner content.* A chart with nothing behind it fails review.

---

## 12. Progressive disclosure — the three tiers (applies everywhere)

1. **Glance** — state/shape/rank only (color, glyph, slope, position).
2. **Hover** — the summary payload (counts, top title, delta, confidence).
3. **Click** — the full evidence chain in the drawer (WHAT→SOURCE).

No band violates this: the page is comprehensible at tier 1, credible at tier 3.

---

## 13. Visualization register (per the brief)

| Data | Form | Inner content (hover → click) |
|---|---|---|
| 3-quarter trend | **Line** (small multiples) | quarter/value/growth + `ai_hypothesis` → full `quarters.json` block |
| QoQ change | **Slope** | delta + driver signal → QoQ evidence drawer |
| Account health | **Matrix** (account × dimension) | signal count + top title → account×dimension evidence |
| Signals | **Timeline** | `evidence` fact → signal drawer |
| Portfolio posture | **Heatmap-of-status** (the matrix doubles as this; single-metric heat avoided) | as matrix |
| NBA priority | **Ranked action cards** | because + who → evidence + promote |
| Org balance | Diverging ribbon | polarity counts → polarity filter |

---

## 14. Design-system binding (no new tokens)

- Palette: existing `--navy`/`--gold` brand + fixed **status semantics** (`--emerald` stable, `--amber` needs-attention, `--red` critical) — reserved, never used as categorical series.
- Categorical (account identity in slope/line): assign from the design-system categorical order in **fixed order**, 5 accounts ≤ ceiling, never cycled/repainted on filter.
- Diverging (balance ribbon, QoQ polarity): teal/emerald ↔ amber/red with **neutral gray midpoint**.
- Serif (Playfair) reserved for the Band-1 situation line only, consistent with briefing-deck usage.
- Dark mode: status + surfaces re-stepped against dark surface (not auto-flipped); scoped like the Delivery `.dh` precedent.
- Drawer = existing `DetailModal` primitive; NBA promote = existing `initiatives` store; account deep-links = existing ACCOUNTS routes.

---

## 15. Data provenance & honesty rules (carried from research layer)

- Home renders **only** what the artifacts contain; empty categories render an explicit empty state, never a fabricated filler.
- Executive cards never invent names — `name:null` roles render as role cards (Novartis CEO).
- AI-derived content is always visually tagged and never styled as fact.
- Every drilled item terminates in real `source_references` links.

---

## 16. Open dependency

Bands 1–3 need an **org rollup object** (counts, per-account × dimension status, QoQ deltas, ranked cross-account opportunity/NBA/heads-up lists) computed from the five `research/*` sets. That compilation (Phase 4) is the prerequisite build step before implementation — this spec defines its required shape by consumption.
