-- Update home page journal section body copy.
update cms_settings
set value = jsonb_set(
  value,
  '{journal,body}',
  to_jsonb(
    'Explore trends in materials, color, and design – curated alongside industry developments, supply chain shifts, and manufacturing innovation.'::text
  )
)
where key in ('home_content', 'home_content_draft')
  and value ? 'journal';
