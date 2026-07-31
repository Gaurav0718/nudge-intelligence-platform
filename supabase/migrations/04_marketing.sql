-- ============ 04: Marketing & Service Line (master §10) ============
create table intelligence_cards (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id),
  service_line service_line,
  tags text[], headline text, summary text,
  what_this_means text, next_best_move text, next_best_move_deadline_hint text,
  reference_url text, reference_label text,
  published_at timestamptz, curated_for text, focus_service_line text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table topics (
  id uuid primary key default uuid_generate_v4(),
  name text, service_line service_line,
  classification text check (classification in ('Whitespace','Popular','Oversaturated')),
  indegene_status text check (indegene_status in ('Active','Gap')),
  driven_by_competitor_ids uuid[],
  window_months int default 18,
  activity_trend jsonb
);

create table account_metrics (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  service_line service_line,
  sources_scanned int, total_mentions int, competitors_active int,
  time_window text, share_of_voice_pct numeric, visibility_position numeric,
  activity_type_breakdown jsonb
);

create table executives (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  name text, title text, company text, location text, bio text,
  previous_companies text[], photo_url text
);

create table next_best_actions (
  id uuid primary key default uuid_generate_v4(),
  service_line service_line,
  source_card_id uuid references intelligence_cards(id),
  headline text, recommendation_text text,
  priority text check (priority in ('low','medium','high')),
  status text check (status in ('new','dismissed','converted')) default 'new',
  created_at timestamptz default now()
);
