-- Contact form submissions use a dedicated pipeline type so they appear
-- distinctly in the admin inbox alongside /start intakes.

alter type pipeline_type add value if not exists 'contact_form';
