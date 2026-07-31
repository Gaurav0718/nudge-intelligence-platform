-- ============ 02: Competition Module (master §10) ============
create type research_status as enum ('InDevelopment','Researched');
create type confidence_level as enum ('High','Medium','Low');

create table competitors (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  research_status research_status not null default 'InDevelopment',
  website_url text,
  corporate_posture text,
  corporate_synthesis_confidence confidence_level,
  mapped_service_lines text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger trg_competitors_updated before update on competitors
  for each row execute function update_updated_at();

create table competitor_differentiators (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id) on delete cascade,
  title text, description text, order_index int default 0
);

create table competitor_signals (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id) on delete cascade,
  headline text not null,
  signal_type text not null,
  source_name text, source_url text, signal_date date,
  what_happened text, why_it_matters text,
  added_context text, added_context_by_user_id uuid references users(id),
  service_line_tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table strategic_moves (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id) on delete cascade,
  title text, confidence confidence_level, description text,
  featured_signal_ids uuid[]
);

create table service_line_positioning (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id) on delete cascade,
  service_line text, positioning_summary text, confidence confidence_level,
  supporting_points jsonb
);

create table questions_for_indegene (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id) on delete cascade,
  service_line text,
  question_text text not null,
  indegene_perspective text,
  captured_by_user_id uuid references users(id),
  captured_at timestamptz
);

create table competitor_relationships (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id) on delete cascade,
  person_name text, title text, company text,
  relationship_type text check (relationship_type in ('Champion','ActiveEngagement','EmergingConnection','KeyLeader')),
  description text, linkedin_url text, source_url text
);

create table strategic_radar_patterns (
  id uuid primary key default uuid_generate_v4(),
  pattern_type text check (pattern_type in ('RecurringMove','ServiceLinePattern','IndegeneBlindSpot')),
  title text, description text,
  contributing_competitor_ids uuid[],
  contributing_signal_ids uuid[]
);
