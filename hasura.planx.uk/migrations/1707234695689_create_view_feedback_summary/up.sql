CREATE OR REPLACE VIEW "public"."feedback_summary" AS
SELECT 
    fb.id AS feedback_id,
    t.name AS team,
    f.slug AS service_slug,
    fb.created_at,
    fb.node_id,
    fb.device,
    fb.user_context,
    fb.user_comment,
    fb.feedback_type,
    fb.status,
    fb.node_type,
    COALESCE(
        published_flow_node.data ->> 'title', 
        published_flow_node.data ->> 'text', 
        published_flow_node.data ->> 'flagSet'
    ) AS node_title,
    published_flow_node.data ->> 'description' AS node_text,
    published_flow_node.data ->> 'info' AS help_text,
    published_flow_node.data ->> 'policyRef' AS help_sources,
    published_flow_node.data ->> 'howMeasured' AS help_definition,
    (fb.user_data -> 'passport' -> 'data' -> '_address' ->> 'single_line_address') AS street_address,
    (fb.user_data -> 'passport' -> 'data' -> '_address' ->> 'uprn') AS UPRN,
    (fb.user_data -> 'passport' -> 'data' ->> 'proposal.projectType') AS project_type,
    (fb.user_data -> 'passport' -> 'data' ->> 'property.constraints.planning') AS constraints,
    published_flow_node.data AS node_data
FROM 
    feedback fb
LEFT JOIN 
    flows f ON f.id = fb.flow_id
LEFT JOIN 
    teams t ON t.id = fb.team_id
LEFT JOIN LATERAL 
    ( 
        SELECT 
            (published_flows.data -> fb.node_id) -> 'data' AS data
        FROM 
            published_flows
        WHERE 
            published_flows.flow_id = fb.flow_id 
            AND published_flows.created_at < fb.created_at
        ORDER BY 
            published_flows.created_at DESC
        LIMIT 1
    ) AS published_flow_node ON true;
