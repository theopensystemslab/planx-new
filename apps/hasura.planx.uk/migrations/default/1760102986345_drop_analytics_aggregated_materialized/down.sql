DROP MATERIALIZED VIEW IF EXISTS "public"."analytics_aggregated_materialized";
CREATE MATERIALIZED VIEW "public"."analytics_aggregated_materialized" AS 
SELECT a.id AS analytics_id,
    max(t.slug) AS team_slug,
    max(f.slug) AS service_slug,
    a.flow_id AS flow_id,
    max(a.created_at) AS analytics_created_at,
    max(a.type) AS analytics_type,
    max((al.allow_list_answers -> 'application.type'::text) ->> 0) AS application_type,
    max(a.referrer) AS referrer,
    string_agg(DISTINCT ((al.allow_list_answers -> 'user.role'::text))::text, ', '::text ORDER BY ((al.allow_list_answers -> 'user.role'::text))::text) AS user_role,
    max(((a.user_agent -> 'platform'::text) ->> 'type'::text)) AS platform,
    string_agg(pt.project_type, ', '::text ORDER BY al.created_at) AS project_types,
    string_agg(al.node_title, ', '::text ORDER BY al.created_at) AS node_titles,
    string_agg(al.node_type, ', '::text ORDER BY al.created_at) AS node_types,
    (array_agg(al.node_title ORDER BY al.created_at))[array_upper(array_agg(al.node_title ORDER BY al.created_at), 1)] AS last_node_title,
    bool_or(al.has_clicked_save) AS has_clicked_save,
    bool_or(al.user_exit) AS tracked_exit,
    string_agg(rf.result_text, ', '::text ORDER BY al.created_at) AS results
FROM ((((analytics a
    LEFT JOIN analytics_logs al ON ((a.id = al.analytics_id)))
    LEFT JOIN flows f ON ((a.flow_id = f.id)))
    LEFT JOIN teams t ON ((t.id = f.team_id)))
    LEFT JOIN LATERAL ( 
        SELECT jsonb_array_elements_text(al.allow_list_answers -> 'proposal.projectType') AS project_type
        WHERE al.allow_list_answers IS NOT NULL 
          AND al.allow_list_answers -> 'proposal.projectType' IS NOT NULL
          AND jsonb_typeof(al.allow_list_answers -> 'proposal.projectType') = 'array'
    ) pt ON (true))
    LEFT JOIN LATERAL ( 
        SELECT (((al.metadata ->> 'flag'::text))::jsonb ->> 'text'::text) AS result_text
        WHERE al.metadata IS NOT NULL 
          AND (al.metadata ->> 'flag'::text) IS NOT NULL
          AND (al.metadata ->> 'flag'::text) != 'null'
    ) rf ON (true)
GROUP BY a.id, a.flow_id
ORDER BY a.id;

GRANT SELECT ON "public"."analytics_aggregated_materialized" TO metabase_read_only;
