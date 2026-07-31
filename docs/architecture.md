# Architecture — The Nudge Intelligence

Internal SPA for **Indegene** (life-sciences commercialization). Four intelligence modules + a cross-module Accounts hub. Built from master spec `/Users/gaurav/Downloads/CLAUDE.md`. Canonical dir: `/Users/gaurav/Desktop/4 in one module/nudge-intelligence-platform` (a stale duplicate at Desktop root should be ignored).

## 1. Stack
React 18 + TypeScript + Vite 5. Router: react-router-dom v6. Charts: Recharts. Icons: lucide-react. DnD: @dnd-kit. Motion: framer-motion. Persistence: @supabase/supabase-js + localStorage fallback. Styling: Tailwind present but inline `style` + CSS vars dominate.
Scripts: `npm run dev` (Vite, port pinned 5180 via `.claude/launch.json`; verify server 5186), `npm run build` (`tsc && vite build` — passes clean). No env vars required.

## 2. Routing (`src/App.tsx`)
- `/` LandingPage, `/briefing/:accountId` ExecutiveBriefingPresentation — both OUTSIDE the shell.
- Everything else nested under `<AppShell>` (`components/layout/AppShell.tsx`).
- Static account routes declared BEFORE dynamic `/accounts/:id` (spec §6 ordering requirement).
- Legacy Delivery paths (`/milestones` etc.) `<Navigate>`-redirect to new views.
- `*` → redirect to `/`.

**Route map by module:**
| Module | Base | Sub-routes |
|---|---|---|
| Competition | `/competition` | `/signals`, `/radar`, `/:competitorId` |
| Delivery Health | `/delivery-health` | `/projects`, `/accounts`, `/actions`, `/engagement/:id` |
| Growth (Sales&Growth) | `/executive-summary` | `/external-news`, `/pipeline-insights`, `/financial-insights`, `/article/:type`, `/news/:id` |
| Marketing | `/marketing` | `/market-pulse`, `/inside-indegene`, `/account-pulse`, `/next-best-action`, `/execution-workspace` |
| Accounts | `/accounts`, `/overview` | `/planning`, `/exec-capital`, `/exec-capital/:id`, `/:id`, `/:id/consolidated`, `/:id/report` |

## 3. Shell & navigation
- `AppShell.tsx`: fixed collapsible sidebar + sticky topbar + `<Outlet>`. `getTitle(path)` maps route → topbar title. `isGrowthModule(path)` decides whether to render the shared `ModuleTabBar` (GROWTH_TABS) — shown on `/executive-summary*` and `/accounts*` EXCEPT `/report`,`/consolidated`. Decorative `.fab-ai` stub bottom-right.
- `Sidebar.tsx`: wordmark + `NudgeMark`. Two sections: **Modules** (Sales&Growth, Marketing, Delivery Health, Competition live; Talent Internal + RFP/RFI `soon`-disabled) and **Accounts** (→ `/overview`, "consolidated"). `ACCOUNTS_SUB` array exists but is dead-coded (`{false && …}`).
- User chip hardcoded **Ritesh Dogra (RD)**.

## 4. Home / landing
`pages/LandingPage.tsx` (full-screen, no shell) → `pages/ModulesPage.tsx` (`/modules`, 3-col card grid from `MODULES` in shared.ts; active cards navigate, `soon` cards dimmed).

## 5. Data architecture
Two layers:
1. **Shared entities** (`data/shared.ts`) — single source of truth used by 2+ modules: `SERVICE_LINES` (6: DAAI, MedComm, MLR, Omnichannel, Regulatory, TechSolutions), `USERS` (7), `CoreAccount` + `CORE_ACCOUNTS` (5: astrazeneca, gsk, jnj, novartis, sanofi) + `LONGTAIL_ACCOUNTS` (9) + `ALL_ACCOUNTS`, `accountById()`, `MODULES`.
2. **Module seeds** (all fully data-driven; extend arrays to add content):
   - `data/accounts.seed.ts` — `AccountDossier` (one_minute_summary, emerging_priorities, big_bets, right_to_win, next_best_actions, sections[], execs[], org, plan), `DOSSIERS` (5), `ALL_EXECS`, `RELATIONSHIP_META`.
   - `data/growthIndex.ts` — assembles 5 per-account files `data/growth/{account}.ts` (each exports LIST_/INFO_/PLAN_/EXECS_/ORG_/NEWS_/NUDGE_) into `ACCOUNTS_LIST`, `ACCOUNT_INFO`, `ACCOUNT_PLAN`, `NUDGE_PROFILE`, `PIPELINE_QUARTERLY/NET_RENEWALS`, `BU_DATA`, `MARQUEE_DEALS`, `INSIGHT_CARDS`. NOTE: internal data keys keep literal `freyr`/`Freyr` spelling intentionally; only string VALUES are Indegene.
   - `data/competition.seed.ts` — `COMPETITORS` (6, all Researched), `DIFFERENTIATORS`, `SIGNALS` (~42), `STRATEGIC_MOVES`, `POSITIONING`, `QUESTIONS`, `RELATIONSHIPS`, `STRATEGIC_HYPOTHESES`, `SIGNAL_TRIANGULATIONS`, `RADAR_PATTERNS`.
   - `data/delivery.seed.ts` — `ENGAGEMENTS` (~26, 5–6/account), types `EngagementSignal/TimelineEvent/RecoveryIntervention/BusinessImpact`. RAG auto-derived: `computeRag(signals, impact)` + helpers `ragOf()`, `ragLabel()`, `engagementsForAccount()`.
   - `data/marketing.seed.ts` — `INTELLIGENCE_CARDS` (20), `TOPICS` (20), `ACCOUNT_METRICS` (10), `MARKET_EXECUTIVES` (15), `NEXT_BEST_ACTIONS` (9) + `cardsForServiceLine/metricsForAccount/execsForAccount` + source helpers + `COMPETITOR_SITE`.

## 6. Persistence (`src/lib`)
- `supabase.ts` — dual-layer generic CRUD. localStorage always-on (prefix `nudge:`); `ensureSeed` seeds once; `dbAll/dbUpsert/dbDelete/dbAllLocal`. Write-through mirrors to Supabase via `dbSync.ts` (`mirror`, `sync`, `SYNC_ENABLED`) only when env vars present.
- `supabase/migrations/00–06` — full schema (spec §10). RLS permissive `USING(true)`, no auth — demo only, flag before exposure.
- No React state manager. State = seed data + localStorage + component `useState`.

## 7. Cross-module rollup (`lib/crossModule.ts`)
`crossModuleFor(accountId)` → `CrossModuleSignals` { deliveryRag (worst of engagements), deliveryCounts per RAG, openCompetitionSignals (90d cutoff), shareOfVoice, topServiceLine }. This is the aggregation used by the Accounts hub.

## 8. Shared initiatives (`lib/initiatives.ts`)
One `Initiative` store written by BOTH Delivery recovery-interventions AND Marketing next-best-actions (`module` discriminator: Competition/DeliveryHealth/MarketingServiceLine/Growth). `promoteToInitiative()` idempotent. `checklistFor/addChecklistItem/toggleChecklistItem`. localStorage-backed. `hooks/useToast.ts` for transient toasts (2.8s).

## 9. Account-level dashboard pages (`pages/accounts/`)
- `ConsolidatedPage.tsx` — iframe wrapper to `public/consolidated.html` (isolated render).
- `ConsolidatedAccountPage.tsx` — hero + 4-module KPI grid (Sales/Marketing/Delivery/Competition) pulling cross-module signals.
- `AccountsListPage.tsx` — dual card/table view; per-account 2×2 stat tiles, posture badge, priority chips.
- `AccountInfoPage.tsx` — 5-layer nav (Account/Business/Growth/Execution/Workspace); layered slides, data-driven from `ACCOUNT_INFO[id]`.
- `AccountReportPage.tsx` — cross-module report, 4 module banners (01–04) + sticky jump nav.
- `ExecCapitalPage.tsx` / `ExecDetailPage.tsx` — @dnd-kit drag-to-reparent org chart (`ORG_BY_ACCOUNT`).
- `AccountPlanningPage.tsx` — versioned draft/publish.
- `ExecutiveBriefingPresentation.tsx` — no-shell Playfair deck, HTML export via `lib/exportHtml.ts`.
- No Recharts in account pages.

## 10. Recharts usage
Only 3 pages: `growth/PipelineInsightsPage` (BarChart), `marketing/AccountPulsePage` (RadialBar + Pie), `marketing/MarketPulsePage` (AreaChart).

## 11. Intentional gaps (spec §13.4 — do NOT "fix")
Pipeline Insights Stage/Forecast filters + ACV/TCV toggle decorative; global `.fab-ai` AI-assistant is a stub; no auth, RLS permissive by design.

## 12. Seed provenance
Delivery from `../Delivery_Module/*.docx`; Growth/Accounts re-keyed from `../Growth_Module` Freyr dossiers → Indegene; Competition + Marketing generated fresh. The four per-module CLAUDE.md docs the master spec references do NOT exist in the repo.
