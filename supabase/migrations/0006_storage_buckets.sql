-- Storage buckets for the CMS media library and customer intake uploads.
-- Both are private; admin uploads through signed URLs minted server-side,
-- public reads on `cms-media` go through transformed Supabase URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cms-media', 'cms-media', true, 26214400,
    array['image/jpeg','image/png','image/webp','image/avif','image/gif','image/svg+xml','video/mp4','video/webm']),
  ('intake-uploads', 'intake-uploads', false, 52428800, null)
on conflict (id) do nothing;

-- cms-media: anon read, admin write
drop policy if exists "cms_media_public_read" on storage.objects;
create policy "cms_media_public_read"
  on storage.objects for select
  using (bucket_id = 'cms-media');

drop policy if exists "cms_media_admin_write" on storage.objects;
create policy "cms_media_admin_write"
  on storage.objects for insert
  with check (
    bucket_id = 'cms-media'
    and exists (select 1 from admins a where a.id = auth.uid())
  );

drop policy if exists "cms_media_admin_update" on storage.objects;
create policy "cms_media_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'cms-media'
    and exists (select 1 from admins a where a.id = auth.uid())
  );

drop policy if exists "cms_media_admin_delete" on storage.objects;
create policy "cms_media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'cms-media'
    and exists (select 1 from admins a where a.id = auth.uid())
  );

-- intake-uploads: service role only (customer uploads land via API, admin
-- reads via signed URL). No anon read path.
drop policy if exists "intake_uploads_admin_read" on storage.objects;
create policy "intake_uploads_admin_read"
  on storage.objects for select
  using (
    bucket_id = 'intake-uploads'
    and exists (select 1 from admins a where a.id = auth.uid())
  );
