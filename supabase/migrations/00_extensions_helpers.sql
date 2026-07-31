-- ============ 00: extensions & helpers ============
-- The Nudge Intelligence — full schema (master CLAUDE.md §10).
-- Run these files in order (00 → 06) in the Supabase SQL Editor.

create extension if not exists "uuid-ossp";

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
