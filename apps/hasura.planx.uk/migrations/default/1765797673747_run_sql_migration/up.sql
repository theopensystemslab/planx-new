REVOKE SELECT ON "public"."analytics_planning_data_health" FROM metabase_read_only;

DROP VIEW IF EXISTS "public"."analytics_planning_data_health";

CREATE OR REPLACE VIEW "public"."analytics_planning_data_teams" AS (
SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.slug AS team_slug,
    ti.has_planning_data AS planning_constraints_enabled_in_planx,
    ts.reference_code AS planning_data_reference_code,
    ts.is_trial,
    FORMAT('https://provide.planning.data.gov.uk/organisations/local-authority:%s', ts.reference_code) AS planning_data_link
FROM teams t
    JOIN team_settings ts ON ts.team_id = t.id
    JOIN team_integrations ti ON ti.team_id = t.id
    WHERE ts.reference_code IS NOT NULL
);

GRANT SELECT ON "public"."analytics_planning_data_teams" TO metabase_read_only;
