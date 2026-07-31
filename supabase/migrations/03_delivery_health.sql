-- ============ 03: Delivery Health (master §9.2 / §10) ============
create type rag_status as enum ('Critical','NeedsAttention','Stable');
create type impact_level as enum ('Low','Medium','High');
create type signal_family as enum ('DeliveryPerformance','RiskCompliance','CustomerSentiment','OperationsData','PeopleData');
create type confidence_level as enum ('Low','Medium','High');

create table engagements (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id),
  service_line service_line,
  delivery_lead_user_id uuid references users(id),
  name text not null,
  rag_status rag_status not null default 'Stable',
  root_cause text,
  impact_revenue impact_level, impact_margin impact_level, impact_compliance impact_level,
  impact_reputation impact_level, impact_people impact_level,
  business_impact_rationale text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger trg_engagements_updated before update on engagements
  for each row execute function update_updated_at();

create table engagement_signals (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid references engagements(id) on delete cascade,
  family signal_family not null,
  label text not null,
  narrative text,
  trend_cycle_1 rag_status, trend_cycle_2 rag_status, trend_cycle_3 rag_status,
  current_value numeric, target_value numeric, unit text
);

create table signal_timeline_events (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid references engagements(id) on delete cascade,
  event_date date not null,
  family signal_family,
  description text not null,
  is_current boolean default false
);

create table recovery_interventions (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid references engagements(id) on delete cascade,
  title text not null,
  status text check (status in ('AwaitingReview','Accepted','InProgress','Rejected')) default 'AwaitingReview',
  confidence confidence_level,
  due_date date, owner_name text,
  rationale text, expected_signal_improvement text,
  evidence_summary text[]
);

create table milestones (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid references engagements(id) on delete cascade,
  name text, planned_date date, actual_or_forecast_date date,
  status text check (status in ('NotStarted','InProgress','Complete','Delayed')),
  owner_user_id uuid references users(id)
);

create table resource_allocations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  engagement_id uuid references engagements(id) on delete cascade,
  role text, allocation_pct numeric, week_start_date date
);

create table sla_metrics (
  id uuid primary key default uuid_generate_v4(),
  engagement_id uuid references engagements(id) on delete cascade,
  name text, target_value numeric, actual_value numeric, unit text, period text,
  status text check (status in ('Met','Missed','AtRisk'))
);
