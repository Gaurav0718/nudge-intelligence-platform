# Supabase Setup & Sync — The Nudge Intelligence

## How persistence works

Every editable feature saves to **localStorage** under a string key, always-on. When Supabase
credentials are present, each write is **mirrored** to a single table, and on app boot all rows
are **hydrated** back into localStorage — so state follows you across browsers/devices.

- **Write-through:** `src/lib/dbSync.ts → mirror(key, value)` runs on every save.
- **Read-through:** `hydrateAll()` in `src/main.tsx` pulls all rows before first render.
- **One table:** `app_state(store text pk, data jsonb, updated_at)` — the localStorage key is the
  primary key, the value is JSONB. No per-feature schema, so nothing can drift out of sync.

> The older `supabase/migrations/00–06` files describe a fully-normalised schema. They are
> **optional reference only** — the running app syncs through `app_state`. Run just the one file below.

## Setup (5 steps, ~5 min)

1. **Create a project** at [supabase.com](https://supabase.com) → New project. Wait for it to provision.

2. **Run the migration.** In the project, open **SQL Editor → New query**, paste the contents of
   `supabase/migrations/10_app_state_sync.sql`, and **Run**. (Creates the `app_state` table + a
   permissive RLS policy.)

3. **Get the keys.** **Project Settings → API** → copy the **Project URL** and the **anon public** key.

4. **Add a `.env`** in the project root (`/Users/gaurav/Desktop/4 in one module/nudge-intelligence-platform/.env`):
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

5. **Restart the dev server** (`npm run dev`). Vite only reads `.env` at startup.

## Verify it's syncing

1. Open the app, edit anything (e.g. Account Planning → type in a section → **Publish**; or Delivery →
   accept an intervention).
2. In Supabase → **Table Editor → app_state** → rows appear/update (one per feature key, e.g.
   `nudge:initiatives`, `nudge_plan_sections_astrazeneca`, `nudge_versions_astrazeneca_business_health`).
3. Open the app in a **different browser / incognito** → your edits load (hydrated from `app_state`).

If nothing appears: confirm the two env vars are set and the server was restarted; check the browser
console/network for a failed `app_state` request (usually a typo in the URL/key or the migration not run).

## What syncs (feature audit)

| Area | Feature | Persists |
|---|---|---|
| Delivery Health | Accept / reject / complete interventions; Action Tracker status | ✅ `nudge:initiatives` |
| Delivery Health | Account-Planning Delivery Update (table + uploaded image) | ✅ plan section |
| Marketing | Next Best Action → promote; Execution Workspace add/edit/delete + checklists; **+ Add Initiative** | ✅ `nudge:initiatives`, `nudge:checklist_items` |
| Competition | Synthesis Agree/Partially/Disagree feedback | ✅ (localStorage key) |
| Accounts · Planning | All 12 sections — Account Context, Business Health, Delivery Update, Competition Update, Immediate Next Steps, Account Priority, Big Bets, Power Centres, Emerging Pipeline, Inferences, Review Recap — plus **draft/publish version history** | ✅ `nudge_plan_sections_*`, `nudge_versions_*` |
| Accounts · Exec Capital | Interests, company role, media, social, traits, sales insights, conferences, awards, notes, selling points, action plan, org chart (drag-reparent) | ✅ `nudge_exec_*`, `nudge_org_*` |
| Accounts | Cross-module org chart edits | ✅ `nudge:org_charts` |

**Not synced (by design — UI state, not data):** active tab, search text, filter/dropdown selections,
open modals, image zoom level. These reset per session on purpose.

## Security note

RLS ships **permissive** (`using (true)`) with the **anon** key — anyone holding the anon key has full
read/write on `app_state`. Fine for an internal demo on a trusted network. **Before any public exposure**,
add real auth + tighten the policy (e.g. `using (auth.uid() is not null)`), or move writes behind an
authenticated role.
