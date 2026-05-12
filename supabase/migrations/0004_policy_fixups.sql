-- Idempotent re-creation of the RLS policies declared in 0001_pipelines.sql.
-- The original migration relied on `create policy if not exists` which is
-- only supported on PostgreSQL 16+. Re-running it on PG <16 (or in some
-- managed PG forks) raises an error. Drop-then-create is portable and
-- guarantees that re-running this file on any PG is safe.

do $$
declare
  policies record;
begin
  for policies in
    select tbl, name from (values
      ('admins',         'service_role_all_admins'),
      ('admins',         'admins_select_self'),
      ('customers',      'service_role_all_customers'),
      ('customers',      'admins_full_customers'),
      ('customers',      'customers_read_self'),
      ('projects',       'service_role_all_projects'),
      ('projects',       'admins_full_projects'),
      ('enquiries',      'service_role_all_enquiries'),
      ('enquiries',      'admins_full_enquiries'),
      ('attachments',    'service_role_all_attachments'),
      ('attachments',    'admins_full_attachments'),
      ('pipeline_steps', 'service_role_all_pipeline_steps'),
      ('pipeline_steps', 'admins_full_pipeline_steps')
    ) as t(tbl, name)
  loop
    execute format('drop policy if exists %I on %I', policies.name, policies.tbl);
  end loop;
end$$;

-- Recreate them with the same shape as the original migration.
create policy service_role_all_admins
  on admins for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admins_select_self
  on admins for select
  using (auth.uid() = id);

create policy service_role_all_customers
  on customers for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admins_full_customers
  on customers for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy customers_read_self
  on customers for select
  using (id = auth.uid());

create policy service_role_all_projects
  on projects for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admins_full_projects
  on projects for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy service_role_all_enquiries
  on enquiries for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admins_full_enquiries
  on enquiries for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy service_role_all_attachments
  on attachments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admins_full_attachments
  on attachments for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));

create policy service_role_all_pipeline_steps
  on pipeline_steps for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy admins_full_pipeline_steps
  on pipeline_steps for all
  using (exists (select 1 from admins a where a.id = auth.uid()))
  with check (exists (select 1 from admins a where a.id = auth.uid()));
