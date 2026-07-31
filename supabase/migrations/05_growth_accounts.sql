-- ============ 05: Growth / Accounts (18 exec-capital + 2 account-planning tables, master §10) ============
create table exec_profiles          (id uuid primary key default uuid_generate_v4(), exec_id uuid unique not null, data jsonb, updated_at timestamptz default now());
create table exec_interests         (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, name text, proof_point text, order_index int default 0);
create table exec_company_role      (id uuid primary key default uuid_generate_v4(), exec_id uuid unique not null, content text);
create table exec_media_appearances (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, data jsonb, order_index int default 0);
create table exec_social_activity   (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, data jsonb, order_index int default 0);
create table exec_key_traits        (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, name text, summary text, order_index int default 0);
create table exec_sales_insights    (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, scenario text, dos text[], donts text[], order_index int default 0);
create table exec_conference_summary(id uuid primary key default uuid_generate_v4(), exec_id uuid unique not null, content text);
create table exec_conferences       (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, name text, order_index int default 0);
create table exec_game_time_tags    (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, tag text, order_index int default 0);
create table exec_memberships       (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, data jsonb, order_index int default 0);
create table exec_awards            (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, data jsonb, order_index int default 0);
create table exec_notes             (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, content text, version int default 1, updated_by text default 'Ritesh Dogra', updated_at timestamptz default now());
create table exec_selling_points    (id uuid primary key default uuid_generate_v4(), exec_id uuid unique not null, department text, content text);
create table exec_action_plan       (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, item text, order_index int default 0);
create table exec_relationship_scores(id uuid primary key default uuid_generate_v4(), exec_id uuid not null, score numeric, label text, note text, recorded_at timestamptz default now());
create table exec_tasks             (id uuid primary key default uuid_generate_v4(), exec_id uuid not null, title text, due_date date, priority text, done boolean default false, tab_type text check (tab_type in ('manual','meetings')) default 'manual');
create table org_charts             (id uuid primary key default uuid_generate_v4(), account_id uuid unique references accounts(id), people jsonb not null, orientation text default 'leftright');

create table account_plan_versions (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  section_key text not null,
  version_number int not null,
  is_draft boolean default true,
  data jsonb,
  saved_at timestamptz default now(),
  unique (account_id, section_key, version_number)
);

create table account_context_sections (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  sub_section text not null,
  version_number int not null,
  content text,
  structured jsonb,
  saved_at timestamptz default now(),
  unique (account_id, sub_section, version_number)
);

create or replace function next_plan_version(p_account_id uuid, p_section_key text)
returns int language sql stable as $$
  select coalesce(max(version_number),0)+1 from account_plan_versions
  where account_id = p_account_id and section_key = p_section_key and is_draft = false;
$$;

create or replace function next_context_version(p_account_id uuid, p_sub_section text)
returns int language sql stable as $$
  select coalesce(max(version_number),0)+1 from account_context_sections
  where account_id = p_account_id and sub_section = p_sub_section;
$$;
