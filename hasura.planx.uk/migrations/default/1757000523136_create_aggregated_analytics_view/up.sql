DROP MATERIALIZED VIEW IF EXISTS "public"."analytics_aggregated_materialized";

CREATE MATERIALIZED VIEW "public"."analytics_aggregated_materialized" AS
SELECT 
    analytics_id,
    MAX(team_slug) AS team_slug,
    MAX(service_slug) AS service_slug,
    MAX(flow_id::text)::uuid AS flow_id,  
    MAX(analytics_created_at) AS analytics_created_at,
    MAX(analytics_type) AS analytics_type,
    MAX(application_type) AS application_type,
    MAX(referrer) AS referrer,
    STRING_AGG(DISTINCT user_role, ', ' ORDER BY user_role) AS user_role,
    MAX(platform) AS platform,
    
    STRING_AGG(project_type, ', ' ORDER BY analytics_log_created_at) AS project_types,
    STRING_AGG(node_title, ', ' ORDER BY analytics_log_created_at) AS node_titles,
    STRING_AGG(node_type, ', ' ORDER BY analytics_log_created_at) AS node_types,
    
    (ARRAY_AGG(node_title ORDER BY analytics_log_created_at))[ARRAY_UPPER(ARRAY_AGG(node_title ORDER BY analytics_log_created_at), 1)] AS last_node_title,
    
    BOOL_OR(has_clicked_save) AS has_clicked_save,
    BOOL_OR(is_user_exit) AS tracked_exit,
    
    STRING_AGG(result_text, ', ' ORDER BY analytics_log_created_at) AS results

FROM analytics_summary a
LEFT JOIN LATERAL (
    SELECT jsonb_array_elements_text(a.proposal_project_type::jsonb) AS project_type
    WHERE a.proposal_project_type IS NOT NULL
) pt ON true
LEFT JOIN LATERAL (
    SELECT (a.result_flag::jsonb->>'text') AS result_text
    WHERE a.result_flag IS NOT NULL
) rf ON true

GROUP BY analytics_id
ORDER BY analytics_id;

GRANT SELECT ON "public"."analytics_aggregated_materialized" TO metabase_read_only;