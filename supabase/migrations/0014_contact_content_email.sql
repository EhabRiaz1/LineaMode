-- Update contact page email address.
update cms_settings
set value = jsonb_set(
  value,
  '{details,email}',
  to_jsonb('contact@lineamode-apparel.com'::text)
)
where key in ('contact_content', 'contact_content_draft')
  and value ? 'details';
