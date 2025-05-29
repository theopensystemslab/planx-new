alter table "public"."lowcal_sessions" add column "has_user_saved" boolean
 not null default 'false';

COMMENT ON COLUMN "public"."lowcal_sessions"."has_user_saved" IS E'Tracks if email reminder and expiry events have been setup for session';