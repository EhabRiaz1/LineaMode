-- Add manifesto group logo slots to about page content.
update cms_settings
set value = jsonb_set(
  coalesce(value, '{}'::jsonb),
  '{manifesto,brandLogos}',
  '[
    {"name": "Lineamode", "image": "/brand/lineamode-wordmark.png"},
    {"name": "Intermoda", "image": ""},
    {"name": "Matrix", "image": ""},
    {"name": "Triple Tree", "image": ""}
  ]'::jsonb,
  true
)
where key in ('about_content', 'about_content_draft')
  and value is not null;
