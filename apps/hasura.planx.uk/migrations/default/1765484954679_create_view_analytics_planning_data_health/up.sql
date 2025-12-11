CREATE OR REPLACE VIEW analytics_planning_data_health AS (
SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.slug AS team_slug,
    ti.has_planning_data AS planning_constraints_enabled_in_planx,
    ts.reference_code AS planning_data_reference_code,
    CASE 
        WHEN ts.reference_code IS NOT NULL
        THEN FORMAT('https://provide.planning.data.gov.uk/organisations/local-authority:%s', ts.reference_code)
        ELSE NULL
    END AS planning_data_link
FROM teams t
    JOIN team_settings ts ON ts.team_id = t.id
    JOIN team_integrations ti ON ti.team_id = t.id
);

GRANT SELECT ON public.analytics_planning_data_health TO metabase_read_only;
