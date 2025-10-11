alter table "public"."team_integrations" add column "has_planning_data" boolean
 not null default 'false';

comment on column "public"."team_integrations"."has_planning_data" is E'Indicates if team has GIS data set up on planning.data.gov . This controls if GIS queries are proxied to Planning Data, or our custom GIS endpoints.';

UPDATE team_integrations
SET has_planning_data = COALESCE((teams.settings->>'hasPlanningData')::boolean, false)
FROM teams
WHERE team_integrations.team_id = teams.id;
