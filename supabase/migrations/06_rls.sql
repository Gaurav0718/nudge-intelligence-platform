-- ============ 06: RLS (internal tool, permissive by design — master §10 / §13.2) ============
-- AUTH NOTE (carried forward from Growth §10.1 verbatim): every table ships with
-- USING (true) WITH CHECK (true) under anon — there is NO authentication anywhere in
-- this design. Intentional for an internal demo tool. FLAG THIS EXPLICITLY before this
-- platform is exposed beyond a trusted internal network — anyone holding the anon key
-- has full read/write on all five modules' data.
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy allow_all_%1$s on %1$I for all using (true) with check (true);', t);
  end loop;
end $$;
