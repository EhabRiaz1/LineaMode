-- About page founders preview: three cards with contact fields, no fourth founder.
update cms_settings
set value = jsonb_set(
  value,
  '{foundersCta}',
  coalesce(value->'foundersCta', '{}'::jsonb)
    || jsonb_build_object('headlineLine1', 'Three Founders.')
    || jsonb_build_object(
      'cards',
      coalesce(
        (
          select jsonb_agg(
            case
              when elem->>'name' = 'Founder Three' then
                elem
                || jsonb_build_object('name', 'Fawad Shah')
                || jsonb_build_object('description', '')
                || jsonb_build_object('email', coalesce(nullif(elem->>'email', ''), 'studio@lineamode.com'))
                || jsonb_build_object('whatsapp', coalesce(nullif(elem->>'whatsapp', ''), '+92 300 0000000'))
                || jsonb_build_object('linkedin', coalesce(elem->'linkedin', '""'::jsonb))
              else
                elem
                || jsonb_build_object('description', '')
                || jsonb_build_object('linkedin', coalesce(elem->'linkedin', '""'::jsonb))
                || jsonb_build_object('email', coalesce(elem->>'email', ''))
                || jsonb_build_object('whatsapp', coalesce(elem->>'whatsapp', ''))
            end
          )
          from jsonb_array_elements(coalesce(value->'foundersCta'->'cards', '[]'::jsonb)) with ordinality as t(elem, ord)
          where ord <= 3
        ),
        '[]'::jsonb
      )
    ),
  true
)
where key in ('about_content', 'about_content_draft')
  and value is not null;
