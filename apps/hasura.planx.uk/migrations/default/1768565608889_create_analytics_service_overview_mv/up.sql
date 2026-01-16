CREATE MATERIALIZED VIEW "public"."analytics_service_overview" AS
    SELECT 
        teams.slug AS team,
        flows.slug AS service,
        flows.status AS status,
        flows.created_at,
        MIN(analytics.created_at) AS first_used,
        flows.id AS flow_id
    FROM 
        flows
    INNER JOIN 
        teams ON flows.team_id = teams.id
    LEFT JOIN 
        analytics ON analytics.flow_id = flows.id
    GROUP BY 
        teams.slug,
        flows.slug,
        flows.status,
        flows.created_at,
        flows.id;

GRANT SELECT ON "public"."analytics_service_overview" TO metabase_read_only;