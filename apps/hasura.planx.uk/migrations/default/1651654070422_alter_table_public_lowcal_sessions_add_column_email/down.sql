-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."lowcal_sessions" add column "email" text
--  null;

ALTER TABLE lowcal_sessions DROP COLUMN email