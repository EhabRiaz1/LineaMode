-- 0007_storage_listing_lockdown.sql
-- Tightens public-bucket access for the `cms-media` bucket.
--
-- Background: the previous migration (0006) granted a broad SELECT policy
-- on storage.objects so anonymous clients could read media URLs. Supabase
-- security advisor (`public_bucket_allows_listing`, lint 0025) flags this
-- pattern: a *public* bucket already serves object URLs directly, so the
-- SELECT policy isn't required — and leaving it in place lets clients
-- list every file in the bucket via PostgREST, which we don't want.
--
-- Safe rerun: idempotent.

DROP POLICY IF EXISTS "cms_media_public_read" ON storage.objects;
