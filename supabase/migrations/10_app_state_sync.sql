-- ============================================================================
-- THE ONLY MIGRATION YOU NEED for live sync.
-- Single-table mirror of the app's localStorage state. Every feature (Delivery
-- interventions, Marketing workspace, Account Planning sections + versions,
-- Exec-Capital edits, org charts, Business Health / Delivery / Competition
-- updates, Immediate Next Steps, uploaded images, etc.) is persisted here 1:1.
--
-- The older 00–06 migrations describe a fully-normalised schema and are OPTIONAL
-- reference only — the running app syncs through this table.
-- ============================================================================

create table if not exists app_state (
  store       text primary key,     -- the localStorage key (e.g. 'nudge:initiatives')
  data        jsonb,                 -- the value (array or object)
  updated_at  timestamptz default now()
);

-- Permissive RLS — internal demo, anon key only. FLAG before any public exposure.
alter table app_state enable row level security;

drop policy if exists allow_all_app_state on app_state;
create policy allow_all_app_state on app_state
  for all using (true) with check (true);
