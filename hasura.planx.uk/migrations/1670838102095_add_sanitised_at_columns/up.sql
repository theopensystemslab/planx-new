alter table "public"."lowcal_sessions" add column "sanitised_at" timestamptz null;
COMMENT ON COLUMN "public"."lowcal_sessions"."sanitised_at" IS E'Tracks if personal data has been sanitised from record';

alter table "public"."session_backups" add column "sanitised_at" timestamptz null;
COMMENT ON COLUMN "public"."session_backups"."sanitised_at" IS E'Tracks if personal data has been sanitised from record';

alter table "public"."uniform_applications" add column "sanitised_at" timestamptz null;
COMMENT ON COLUMN "public"."uniform_applications"."sanitised_at" IS E'Tracks if personal data has been sanitised from record';

alter table "public"."bops_applications" add column "sanitised_at" timestamptz null;
COMMENT ON COLUMN "public"."bops_applications"."sanitised_at" IS E'Tracks if personal data has been sanitised from record';

alter table "public"."reconciliation_requests" add column "sanitised_at" timestamptz null;
COMMENT ON COLUMN "public"."reconciliation_requests"."sanitised_at" IS E'Tracks if personal data has been sanitised from record';