-- Update Services process CTA label.
update cms_settings
set value = jsonb_set(
  value,
  '{process,ctaLabel}',
  to_jsonb('Get started'::text)
)
where key in ('capabilities_content', 'capabilities_content_draft')
  and value ? 'process';
