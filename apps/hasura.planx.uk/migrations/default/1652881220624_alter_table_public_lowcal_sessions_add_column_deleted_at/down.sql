-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."lowcal_sessions" add column "deleted_at" timestamptz null;

ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "deleted_at";