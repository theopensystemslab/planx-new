-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."lowcal_sessions" add column "flow_id" uuid;

ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "flow_id";