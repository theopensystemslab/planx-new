DROP VIEW "public"."feedback_summary";

CREATE OR REPLACE VIEW "public"."feedback_summary" AS
SELECT 
    fb.id AS feedback_id,
    t.slug AS team_slug,
    f.slug AS service_slug,
    fb.created_at,
    fb.node_id,
    fb.device,
    fb.user_context,
    fb.user_comment,
    fb.feedback_type,
    fb.status,
    fb.node_type,
    fb.node_data,
    COALESCE(
        fb.node_data ->> 'title', 
        fb.node_data ->> 'text', 
        fb.node_data ->> 'flagSet'
    ) AS node_title,
    fb.node_data ->> 'description' AS node_text,
    fb.node_data ->> 'info' AS help_text,
    fb.node_data ->> 'policyRef' AS help_sources,
    fb.node_data ->> 'howMeasured' AS help_definition,
    COALESCE(
        fb.user_data -> 'passport' -> 'data' -> '_address' ->> 'single_line_address',
        fb.user_data -> 'passport' -> 'data' -> '_address' ->> 'title'
    ) AS address,
    (fb.user_data -> 'passport' -> 'data' -> '_address' ->> 'uprn') AS uprn,
    (fb.user_data -> 'passport' -> 'data' ->> 'proposal.projectType') AS project_type,
    (fb.user_data -> 'passport' -> 'data' ->> 'property.constraints.planning') AS intersecting_constraints
FROM 
    feedback fb
LEFT JOIN 
    flows f ON f.id = fb.flow_id
LEFT JOIN 
    teams t ON t.id = fb.team_id;
    
GRANT SELECT ON public.feedback_summary TO metabase_read_only;
