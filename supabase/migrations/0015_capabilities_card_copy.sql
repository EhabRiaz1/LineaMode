-- Update Services / capabilities card copy (full paragraph per discipline).
update cms_settings
set value = jsonb_set(
  value,
  '{capabilities,0,short}',
  to_jsonb(
    'We translate your ideas to well-engineered garments. From concept development to production readiness, our services include trend forecasting, collection planning, design development, tech packs, 3D design, pattern and CAD services, and prototyping to help brands create market-relevant products with confidence.'::text
  )
)
where key in ('capabilities_content', 'capabilities_content_draft')
  and jsonb_typeof(value->'capabilities') = 'array'
  and jsonb_array_length(value->'capabilities') > 0;

update cms_settings
set value = jsonb_set(
  value,
  '{capabilities,1,short}',
  to_jsonb(
    'We focus on materials planning for fabrics, trims, and accessories with our elaborate vendor network to ensure quality and cost expectations are aligned – this helps all manufacturing needs are met to deliver product with quick lead times.'::text
  )
)
where key in ('capabilities_content', 'capabilities_content_draft')
  and jsonb_typeof(value->'capabilities') = 'array'
  and jsonb_array_length(value->'capabilities') > 1;

update cms_settings
set value = jsonb_set(
  value,
  '{capabilities,2,short}',
  to_jsonb(
    'We specialize in the production of knit and woven apparel, offering agile manufacturing, low MOQ flexibility, and responsive execution to support brands across a wide range of product categories and business stages.'::text
  )
)
where key in ('capabilities_content', 'capabilities_content_draft')
  and jsonb_typeof(value->'capabilities') = 'array'
  and jsonb_array_length(value->'capabilities') > 2;

update cms_settings
set value = jsonb_set(
  value,
  '{capabilities,3,short}',
  to_jsonb(
    'We combine analytics, insights, and merchandising expertise to help brands optimize their product range, identify growth opportunities, and build balanced assortments that improve commercial performance and ensure it is aligned with optimised supply chains.'::text
  )
)
where key in ('capabilities_content', 'capabilities_content_draft')
  and jsonb_typeof(value->'capabilities') = 'array'
  and jsonb_array_length(value->'capabilities') > 3;
