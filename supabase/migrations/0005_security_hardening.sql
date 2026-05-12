-- Security hardening based on Supabase advisor findings.
-- 1. Recreate views with `security_invoker = on` so they respect caller RLS
--    instead of running as the view creator.
-- 2. Lock down the search_path on the trigger helper function so it can't
--    be hijacked by a session-level search_path mutation.

alter view if exists admin_roles set (security_invoker = on);
alter view if exists admin_search set (security_invoker = on);

alter function public.set_updated_at() set search_path = pg_catalog, public;
