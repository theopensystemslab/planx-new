alter table "public"."team_settings" add column "has_planning_data" bool;
comment on column "public"."team_settings"."has_planning_data" is E'Global settings for boundary and contact details';
alter table "public"."team_settings" alter column "has_planning_data" set default false;
alter table "public"."team_settings" alter column "has_planning_data" drop not null;
