-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."teams" add column "notifyPersonalisation" jsonb
--  null;

alter table "public"."teams" drop column "notifyPersonalisation";
