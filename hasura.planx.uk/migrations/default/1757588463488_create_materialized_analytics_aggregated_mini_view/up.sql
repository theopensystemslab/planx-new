DROP MATERIALIZED VIEW IF EXISTS "public"."analytics_aggregated_mini";
CREATE MATERIALIZED VIEW "public"."analytics_aggregated_mini" AS 
SELECT a.id AS analytics_id,
    a.flow_id AS flow_id,
    max(a.created_at) AS analytics_created_at,
    string_agg(pt.project_type, ', '::text ORDER BY al.created_at) AS project_types,
    string_agg(al.node_title, ', '::text ORDER BY al.created_at) AS node_titles,
    string_agg(al.node_type, ', '::text ORDER BY al.created_at) AS node_types,
    (array_agg(al.node_title ORDER BY al.created_at))[array_upper(array_agg(al.node_title ORDER BY al.created_at), 1)] AS last_node_title
FROM analytics a
    LEFT JOIN analytics_logs al ON (a.id = al.analytics_id)
    LEFT JOIN flows f ON (a.flow_id = f.id)
    LEFT JOIN LATERAL (
        SELECT jsonb_array_elements_text((al.allow_list_answers -> 'proposal.projectType'::text)::jsonb) AS project_type
    ) pt ON (al.allow_list_answers -> 'proposal.projectType'::text IS NOT NULL)
GROUP BY a.id
ORDER BY a.id;

GRANT SELECT ON "public"."analytics_aggregated_mini" TO metabase_read_only;
