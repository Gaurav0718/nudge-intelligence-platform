# The Nudge Intelligence

One React SPA used internally at **Indegene** (a life-sciences commercialization company), backed by a single Supabase (Postgres) project. Built to the master integration spec (`CLAUDE.md` §0–§14).

A landing screen offers two entry points — **Modules** (four live intelligence modules) and **Accounts** (a cross-module account command center) — for a demo tenant monitoring five fully-seeded pharma clients: **AstraZeneca, GSK, Johnson & Johnson, Novartis, Sanofi** (plus a lightly-seeded extended roster).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc + vite production build
```

No environment variables are required — the app runs entirely on **localStorage + seed data**. Optionally add Supabase credentials (see `.env.example`) to enable read-through / write-through persistence; run `supabase/migrations/00 → 06` in the SQL Editor first.

## The four modules (all live)

| Module | Route | Highlights |
|---|---|---|
| **Competition** | `/competition` | Re-skinned into the shared navy/gold shell (indigo retired). Competitor synthesis, differentiators, strategic moves, service-line positioning, signal feed with source receipts, gated Strategic Radar, Agree/Partially/Disagree feedback → shared `synthesis_feedback`. |
| **Delivery Health** | `/delivery-health` | **Rebuilt to match the production reference (`nudge-delivery-module_latest.html`).** Four views — Dashboard (health metrics, intervention-pipeline donut, signal-family cards, risk-concentration matrix, account health), Projects (filterable grouped cards), Account Health (priorities/concerns/positive insight cards), Interventions (status tabs). Project Detail shows the evidence pack (expandable signal cards with source/confidence/3-cycle trend), signal timeline, root cause, business-impact bars, and recovery interventions. RAG is auto-computed from signal families; accepting an intervention writes to the shared `initiatives` table. |
| **Growth (Sales & Growth)** | `/executive-summary` | Account-aware external news, AI insight cards, Pipeline Insights (charts + documented decorative filters), Financial Insights. Re-keyed Freyr → Indegene. |
| **Marketing & Service Line** | `/marketing` | Executive AI Summary, Market Pulse (topic landscape / content-intelligence heatmap / whitespace / competitive heat), Inside Indegene, Account Pulse (SoV ↔ Exec Focus), Next Best Action → Execution Workspace with checklists. |

## Accounts Hub (cross-module)

`/accounts` — one pane of glass per client with a **cross-module health strip** (Delivery RAG · Marketing SoV · Competition signals). Each dossier (`/accounts/:id`) reuses the 17-section / 5-layer accordion, adds a **Signals Layer** aggregating all four modules, plus Exec Capital (drag-to-reparent org chart), versioned Account Planning, and a standalone **Executive Briefing** deck (`/briefing/:accountId`, no shell, Playfair serif, HTML export).

## Architecture

- **React 18 + TypeScript + Vite**, react-router-dom v6, Recharts, lucide-react, @dnd-kit, framer-motion.
- **Single design-token file** (`src/index.css`) — navy `#1B365D` / gold `#D4AF37`. The Delivery module additionally loads `src/pages/delivery-health/deliveryTheme.css`, a scoped (`.dh`) port of the production reference's component styles.
- **Shared entities built once** (§1.4/§7): one `accounts`, `users`, `service_lines`, `initiatives` + `checklist_items`, `synthesis_feedback` — scoped by `module` + `source_type`.
- **Dual-layer persistence** (`src/lib/supabase.ts`): localStorage always-on cache + Supabase read-through/write-through when env vars are present (`dbAll`/`dbUpsert`/`dbDelete`).
- **Full schema as real migrations** — `supabase/migrations/*.sql` (§10).

## Seed data provenance (§11)

- **Delivery Health** — transcribed from the supplied `Delivery_Module/*.docx` (6 engagements × 5 accounts).
- **Growth / Accounts** — re-keyed from the supplied Freyr-branded `Growth_Module` dossiers onto Indegene + the 5 core accounts.
- **Competition & Marketing** — generated fresh (no seed docx supplied). All dummy content; no real proprietary intelligence implied.

## Known / intentional gaps (do **not** "fix", §13.4)

- Pipeline Insights' Stage/Forecast filters and the ACV/TCV basis toggle are illustrative in this demo build.
- The global floating AI-assistant button is a decorative stub.
- **No authentication** — RLS ships permissive (`USING (true)`), intentional for an internal demo. Flag before any exposure beyond a trusted network.
