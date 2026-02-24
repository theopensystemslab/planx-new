alter table "public"."submission_integrations" alter column "deleted_at" drop not null;
alter table "public"."submission_integrations" add column "deleted_at" timestamptz;
