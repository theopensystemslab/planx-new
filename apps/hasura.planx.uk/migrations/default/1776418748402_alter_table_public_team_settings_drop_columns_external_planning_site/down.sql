alter table "public"."team_settings" add column "external_planning_site_url" text;
alter table "public"."team_settings" alter column "external_planning_site_url" drop not null;
alter table "public"."team_settings" alter column "external_planning_site_url" set default ''https://www.planningportal.co.uk/'::text';
comment on column "public"."team_settings"."external_planning_site_url" is E'Global settings for boundary and contact details';

alter table "public"."team_settings" add column "external_planning_site_name" text;
alter table "public"."team_settings" alter column "external_planning_site_name" drop not null;
alter table "public"."team_settings" alter column "external_planning_site_name" set default ''Planning Portal'::text';
comment on column "public"."team_settings"."external_planning_site_name" is E'Global settings for boundary and contact details';
