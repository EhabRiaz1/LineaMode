-- Pipeline and intake schema for Lineamode.
-- Run with the Supabase CLI or SQL editor.

create extension if not exists "uuid-ossp";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'pipeline_type') then
    create type pipeline_type as enum ('design_idea', 'design_scratch', 'manufacture_existing');
  end if;
  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('draft', 'reviewing', 'quoted', 'in_progress', 'delivered', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'step_state') then
    create type step_state as enum ('pending', 'in_progress', 'blocked', 'done');
  end if;
end$$;

-- Admins map Supabase auth users to roles.
create table if not exists admins (
  id uuid primary key, -- auth.uid
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Customers
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  name text,
  company text,
  phone text,
  country text,
  timeline text,
  budget_range text,
  created_at timestamptz not null default now()
);
create unique index if not exists customers_email_key on customers(email);

-- Projects
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  pipeline_type pipeline_type not null,
  status project_status not null default 'draft',
  current_step text,
  brief jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_customer_id_idx on projects(customer_id);
create index if not exists projects_status_idx on projects(status);
create index if not exists projects_type_idx on projects(pipeline_type);

-- Enquiries (initial intake + follow-ups)
create table if not exists enquiries (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  intake jsonb not null,
  notes text,
  source text default 'web',
  created_at timestamptz not null default now()
);
create index if not exists enquiries_project_id_idx on enquiries(project_id);

-- Attachments metadata (files live in Supabase Storage)
create table if not exists attachments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  file_name text not null,
  file_type text,
  file_size_bytes bigint,
  storage_path text not null,
  created_at timestamptz not null default now()
);
create index if not exists attachments_project_id_idx on attachments(project_id);

-- Pipeline steps / audit trail
create table if not exists pipeline_steps (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  label text not null,
  state step_state not null default 'pending',
  note text,
  actor_id uuid, -- admin uid or null for system
  actor_role text,
  created_at timestamptz not null default now()
);
create index if not exists pipeline_steps_project_id_idx on pipeline_steps(project_id);

-- Row Level Security ---------------------------------------------------------
alter table admins enable row level security;
alter table customers enable row level security;
alter table projects enable row level security;
alter table enquiries enable row level security;
alter table attachments enable row level security;
alter table pipeline_steps enable row level security;

-- Helpers
create or replace view admin_roles as
select id as admin_id, role from admins;

-- Policies: service role full access
create policy if not exists "service_role_all_admins"
  on admins for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists "service_role_all_customers"
  on customers for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists "service_role_all_projects"
  on projects for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists "service_role_all_enquiries"
  on enquiries for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists "service_role_all_attachments"
  on attachments for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy if not exists "service_role_all_pipeline_steps"
  on pipeline_steps for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Policies: admins (based on auth.uid being in admins)
create policy if not exists "admins_select_self"
  on admins for select
  using (auth.uid() = id);

create policy if not exists "admins_full_customers"
  on customers for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy if not exists "admins_full_projects"
  on projects for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy if not exists "admins_full_enquiries"
  on enquiries for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy if not exists "admins_full_attachments"
  on attachments for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy if not exists "admins_full_pipeline_steps"
  on pipeline_steps for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

-- Customers can read their own records if they authenticate later (optional)
create policy if not exists "customers_read_self"
  on customers for select
  using (id = auth.uid());
