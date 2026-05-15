-- Speed up the admin dashboard funnel lookup.
create index if not exists intake_events_event_session_idx
  on intake_events(event, session_id)
  where session_id is not null;
