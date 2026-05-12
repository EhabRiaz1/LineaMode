-- Supabase-native CMS for the customer-facing Lineamode site.
-- Pages are stored as a single jsonb block tree per slug; revisions are
-- snapshotted on every publish so the admin can roll back.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'cms_status') then
    create type cms_status as enum ('draft', 'published', 'archived');
  end if;
end$$;

-- Media -----------------------------------------------------------------
create table if not exists cms_media (
  id uuid primary key default uuid_generate_v4(),
  storage_path text not null unique,
  mime text,
  width int,
  height int,
  alt text,
  focal_x numeric default 0.5,
  focal_y numeric default 0.5,
  tags text[] default array[]::text[],
  uploaded_by uuid references admins(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists cms_media_tags_gin on cms_media using gin (tags);
alter table cms_media enable row level security;

-- Pages -----------------------------------------------------------------
create table if not exists cms_pages (
  slug text primary key,
  title text not null,
  status cms_status not null default 'draft',
  blocks jsonb not null default '[]'::jsonb,
  draft_blocks jsonb,
  seo jsonb default '{}'::jsonb,
  draft_seo jsonb,
  version int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references admins(id) on delete set null,
  published_at timestamptz
);
alter table cms_pages enable row level security;

drop trigger if exists trg_cms_pages_updated_at on cms_pages;
create trigger trg_cms_pages_updated_at
before update on cms_pages
for each row execute function public.set_updated_at();

create table if not exists cms_pages_revisions (
  id uuid primary key default uuid_generate_v4(),
  slug text not null references cms_pages(slug) on delete cascade,
  blocks jsonb not null,
  seo jsonb default '{}'::jsonb,
  version int not null,
  updated_by uuid references admins(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists cms_pages_revisions_slug_idx
  on cms_pages_revisions(slug, version desc);
alter table cms_pages_revisions enable row level security;

-- Settings --------------------------------------------------------------
create table if not exists cms_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references admins(id) on delete set null
);
alter table cms_settings enable row level security;

drop trigger if exists trg_cms_settings_updated_at on cms_settings;
create trigger trg_cms_settings_updated_at
before update on cms_settings
for each row execute function public.set_updated_at();

-- Journal ---------------------------------------------------------------
create table if not exists cms_journal (
  slug text primary key,
  title text not null,
  excerpt text,
  body_mdx text,
  cover_media_id uuid references cms_media(id) on delete set null,
  category text,
  read_time text,
  status cms_status not null default 'draft',
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references admins(id) on delete set null
);
create index if not exists cms_journal_published_idx
  on cms_journal(status, published_at desc nulls last);
alter table cms_journal enable row level security;

drop trigger if exists trg_cms_journal_updated_at on cms_journal;
create trigger trg_cms_journal_updated_at
before update on cms_journal
for each row execute function public.set_updated_at();

-- RLS policies ----------------------------------------------------------
-- Service role + admins write; the customer-facing site reads via the
-- service role from the server (no anon read paths). Anonymous customers
-- never query cms_* tables directly.

do $$
declare
  t text;
  policy_names text[] := array[
    'service_role_all',
    'admins_full'
  ];
  tbl text;
  policy text;
begin
  for tbl in select unnest(array['cms_pages', 'cms_pages_revisions', 'cms_media', 'cms_settings', 'cms_journal']) loop
    execute format('drop policy if exists service_role_all on %I', tbl);
    execute format(
      $f$create policy service_role_all on %I for all
        using (auth.role() = 'service_role')
        with check (auth.role() = 'service_role')$f$,
      tbl
    );

    execute format('drop policy if exists admins_full on %I', tbl);
    execute format(
      $f$create policy admins_full on %I for all
        using (exists (select 1 from admins a where a.id = auth.uid()))
        with check (exists (select 1 from admins a where a.id = auth.uid()))$f$,
      tbl
    );
  end loop;
end$$;

-- Seed ------------------------------------------------------------------
-- Stub each page row so the editor has something to open immediately.
insert into cms_pages (slug, title, status, blocks)
values
  ('home', 'Home', 'draft', '[]'::jsonb),
  ('about', 'About', 'draft', '[]'::jsonb),
  ('capabilities', 'Capabilities', 'draft', '[]'::jsonb),
  ('design', 'Design', 'draft', '[]'::jsonb),
  ('products', 'Products', 'draft', '[]'::jsonb),
  ('sustainability', 'Sustainability', 'draft', '[]'::jsonb),
  ('lookbook', 'Lookbook', 'draft', '[]'::jsonb),
  ('journal', 'Journal', 'draft', '[]'::jsonb),
  ('contact', 'Contact', 'draft', '[]'::jsonb),
  ('founders', 'Founders', 'draft', '[]'::jsonb)
on conflict (slug) do nothing;

insert into cms_settings (key, value)
values
  ('header', '{"cta_label": "Start a project", "cta_href": "/start"}'::jsonb),
  ('footer', '{"copy": "Lineamode Apparel — Islamabad."}'::jsonb),
  ('seo', '{"title_suffix": " · Lineamode", "description": "From idea to ship-ready."}'::jsonb)
on conflict (key) do nothing;
