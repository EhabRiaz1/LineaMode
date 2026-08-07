-- Storage bucket for admin-uploaded documents (currently the products
-- lookbook PDF).
--
-- Kept separate from `cms-media` on purpose:
--   * lookbooks are print-quality and routinely exceed the 25 MB ceiling
--     that suits images, so this bucket gets its own 50 MB limit rather than
--     raising it for every photograph;
--   * PDFs never appear in the image picker, so no filtering, no broken
--     thumbnails, and no meaningless alt-text/focal-point fields.
--
-- Public read because the customer-facing "Explore lookbook" link must open
-- for anyone. Writes are admin-only, mirroring the cms-media policies.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cms-documents', 'cms-documents', true, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cms_documents_public_read" on storage.objects;
create policy "cms_documents_public_read"
  on storage.objects for select
  using (bucket_id = 'cms-documents');

drop policy if exists "cms_documents_admin_write" on storage.objects;
create policy "cms_documents_admin_write"
  on storage.objects for insert
  with check (
    bucket_id = 'cms-documents'
    and exists (select 1 from admins a where a.id = auth.uid())
  );

drop policy if exists "cms_documents_admin_update" on storage.objects;
create policy "cms_documents_admin_update"
  on storage.objects for update
  using (
    bucket_id = 'cms-documents'
    and exists (select 1 from admins a where a.id = auth.uid())
  );

drop policy if exists "cms_documents_admin_delete" on storage.objects;
create policy "cms_documents_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'cms-documents'
    and exists (select 1 from admins a where a.id = auth.uid())
  );
