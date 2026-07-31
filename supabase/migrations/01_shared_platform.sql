-- ============ 01: shared platform tables (master §10) ============
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  display_name text not null,
  initials text not null,
  role text,
  created_at timestamptz default now()
);

create type service_line as enum ('DAAI','MedComm','MLR','Omnichannel','Regulatory','TechSolutions');

create table accounts (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  logo_letter text not null,
  accent_color text not null default '#1B365D',
  is_core_demo_account boolean default false,
  current_revenue numeric,
  three_year_target numeric,
  portfolio_head text,
  account_owner_user_id uuid references users(id),
  posture_label text,
  strategic_posture_text text,
  investment_direction_text text,
  pressure_vector_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger trg_accounts_updated before update on accounts
  for each row execute function update_updated_at();

create type initiative_status as enum ('NotStarted','InProgress','Complete');
create type initiative_module as enum ('Competition','DeliveryHealth','MarketingServiceLine','Growth');

create table initiatives (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  status initiative_status not null default 'NotStarted',
  description text,
  execution_guidance text,
  module initiative_module not null,
  source_type text,
  source_id uuid,
  primary_owner_user_id uuid references users(id),
  secondary_owner_user_id uuid references users(id),
  start_date date,
  target_completion_date date,
  estimated_effort_items text[],
  actual_spend_or_effort_to_date numeric,
  service_line service_line,
  account_id uuid references accounts(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger trg_initiatives_updated before update on initiatives
  for each row execute function update_updated_at();

create table checklist_items (
  id uuid primary key default uuid_generate_v4(),
  initiative_id uuid references initiatives(id) on delete cascade,
  text text not null,
  is_complete boolean default false,
  order_index int default 0
);

create table synthesis_feedback (
  id uuid primary key default uuid_generate_v4(),
  synthesis_type text not null,
  synthesis_id uuid not null,
  user_id uuid references users(id),
  feedback_value text check (feedback_value in ('Agree','Partially','Disagree')),
  submitted_at timestamptz default now()
);
