comment on column "public"."team_integrations"."has_planning_data" is E'Tracks URLs and API keys for integrations';
alter table "public"."team_integrations" alter column "has_planning_data" set default false;
alter table "public"."team_integrations" alter column "has_planning_data" drop not null;
alter table "public"."team_integrations" add column "has_planning_data" bool;
