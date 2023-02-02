CREATE TABLE "public"."session_backups"("id" serial NOT NULL, "session_id" uuid, "flow_id" uuid, "flow_data" jsonb, "user_data" jsonb, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON UPDATE no action ON DELETE no action); COMMENT ON TABLE "public"."session_backups" IS E'stores session data as a backup before taking payment';

COMMENT ON COLUMN "public"."session_backups"."user_data" IS E'includes passport and breadcrumb data';

alter table "public"."session_backups" add column "sanitised_at" timestamptz null;
COMMENT ON COLUMN "public"."session_backups"."sanitised_at" IS E'Tracks if personal data has been sanitised from record';
