alter table "public"."lowcal_sessions" add column "email_event_triggers_setup" boolean
 not null default 'false';

COMMENT ON COLUMN "public"."lowcal_sessions"."email_event_triggers_setup" IS E'Tracks if email reminder and expiry events have beeen setup for session';