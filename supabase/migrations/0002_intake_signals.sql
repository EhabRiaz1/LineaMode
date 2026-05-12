-- Intake signals + console support tables for Lineamode.
-- Adds passive analytics, optional intake fields, project notes, and a unified
-- admin search view. Additive only — no breaking changes to 0001.

create extension if not exists "pg_trgm" with schema extensions;

-- Customers --------------------------------------------------------------
alter table customers
  add column if not exists attribution jsonb,
  add column if not exists device jsonb,
  add column if not exists tags text[] default array[]::text[];

create index if not exists customers_tags_gin on customers using gin (tags);
create index if not exists customers_email_trgm
  on customers using gin (email extensions.gin_trgm_ops);
create index if not exists customers_company_trgm
  on customers using gin (company extensions.gin_trgm_ops);
create index if not exists customers_name_trgm
  on customers using gin (name extensions.gin_trgm_ops);

-- Projects ---------------------------------------------------------------
alter table projects
  add column if not exists brand_stage text,
  add column if not exists calendar_tier text,
  add column if not exists volume_bracket text,
  add column if not exists priorities text[] default array[]::text[],
  add column if not exists assigned_admin_id uuid references admins(id) on delete set null;

create index if not exists projects_assigned_admin_idx on projects(assigned_admin_id);
create index if not exists projects_priorities_gin on projects using gin (priorities);

-- updated_at trigger so admin edits keep the column honest
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
before update on projects
for each row execute function public.set_updated_at();

-- Intake events ----------------------------------------------------------
-- Funnel + drop-off rows. Customer-side fire-and-forget POST writes here.
create table if not exists intake_events (
  id uuid primary key default uuid_generate_v4(),
  session_id text,
  customer_id uuid references customers(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  event text not null,
  payload jsonb,
  ip_hash text,
  user_agent text,
  occurred_at timestamptz not null default now()
);
create index if not exists intake_events_session_idx on intake_events(session_id);
create index if not exists intake_events_event_idx on intake_events(event);
create index if not exists intake_events_occurred_idx on intake_events(occurred_at desc);

alter table intake_events enable row level security;

-- Project notes ---------------------------------------------------------
-- Free-form admin notes attached to a project, used by the project detail Notes tab.
create table if not exists project_notes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid references admins(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists project_notes_project_idx on project_notes(project_id, created_at desc);
alter table project_notes enable row level security;

drop trigger if exists trg_project_notes_updated_at on project_notes;
create trigger trg_project_notes_updated_at
before update on project_notes
for each row execute function public.set_updated_at();

-- Email log -------------------------------------------------------------
-- Outbound emails sent from the admin console (Resend). Kept here so the
-- project Email tab can show a thread without leaking customer addresses
-- into Resend's UI as the only history.
create table if not exists project_emails (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid references admins(id) on delete set null,
  to_address text not null,
  subject text not null,
  body text not null,
  resend_id text,
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists project_emails_project_idx on project_emails(project_id, created_at desc);
alter table project_emails enable row level security;

-- RLS policies ---------------------------------------------------------
drop policy if exists service_role_all_intake_events on intake_events;
create policy service_role_all_intake_events
  on intake_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists admins_full_intake_events on intake_events;
create policy admins_full_intake_events
  on intake_events for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

drop policy if exists service_role_all_project_notes on project_notes;
create policy service_role_all_project_notes
  on project_notes for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists admins_full_project_notes on project_notes;
create policy admins_full_project_notes
  on project_notes for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

drop policy if exists service_role_all_project_emails on project_emails;
create policy service_role_all_project_emails
  on project_emails for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists admins_full_project_emails on project_emails;
create policy admins_full_project_emails
  on project_emails for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

-- Admin search view ----------------------------------------------------
-- Single union view used by the topbar command bar in the admin console.
create or replace view admin_search as
  select
    'customer'::text as kind,
    c.id::text as id,
    coalesce(c.name, c.email) as title,
    coalesce(c.company, c.country) as subtitle,
    c.created_at as updated_at
  from customers c
  union all
  select
    'project'::text as kind,
    p.id::text as id,
    coalesce(c.company, c.name, c.email, 'Untitled') as title,
    p.pipeline_type::text || ' · ' || p.status::text as subtitle,
    p.updated_at
  from projects p
  left join customers c on c.id = p.customer_id;

grant select on admin_search to authenticated, service_role;
