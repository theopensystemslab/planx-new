CREATE OR REPLACE VIEW "public"."feedback_summary" AS 
 SELECT fb.id AS feedback_id,
    t.slug AS team_slug,
    f.slug AS service_slug,
    f.name AS service_name,
    fb.flow_id,
    fb.created_at,
    fb.node_id,
    fb.device,
    fb.user_context,
    fb.user_comment,
    fb.feedback_type,
    fb.status,
    fb.node_type,
    fb.node_data,
    fb.editor_notes,
    COALESCE((fb.node_data ->> 'title'::text), (fb.node_data ->> 'text'::text), (fb.node_data ->> 'flagSet'::text)) AS node_title,
    (fb.node_data ->> 'description'::text) AS node_text,
    (fb.node_data ->> 'info'::text) AS help_text,
    (fb.node_data ->> 'policyRef'::text) AS help_sources,
    (fb.node_data ->> 'howMeasured'::text) AS help_definition,
    COALESCE(((((fb.user_data -> 'passport'::text) -> 'data'::text) -> '_address'::text) ->> 'single_line_address'::text), ((((fb.user_data -> 'passport'::text) -> 'data'::text) -> '_address'::text) ->> 'title'::text)) AS address,
    ((((fb.user_data -> 'passport'::text) -> 'data'::text) -> '_address'::text) ->> 'uprn'::text) AS uprn,
    (((fb.user_data -> 'passport'::text) -> 'data'::text) ->> 'proposal.projectType'::text) AS project_type,
    (((fb.user_data -> 'passport'::text) -> 'data'::text) ->> 'property.constraints.planning'::text) AS intersecting_constraints,
    fb.feedback_score,
    ((((fb.user_data -> 'passport'::text) -> 'data'::text) -> 'application.type'::text) ->> 0) AS application_type
   FROM ((feedback fb
     LEFT JOIN flows f ON ((f.id = fb.flow_id)))
     LEFT JOIN teams t ON ((t.id = fb.team_id)));
     
GRANT SELECT ON "public"."feedback_summary" TO metabase_read_only;
