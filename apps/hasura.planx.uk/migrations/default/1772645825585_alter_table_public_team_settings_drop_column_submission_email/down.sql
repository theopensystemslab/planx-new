alter table "public"."team_settings" add column "submission_email" text;
alter table "public"."team_settings" alter column "submission_email" drop not null;
comment on column "public"."team_settings"."submission_email" is E'Global settings for boundary and contact details';
