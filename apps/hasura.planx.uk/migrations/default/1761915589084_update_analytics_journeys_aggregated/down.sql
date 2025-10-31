DROP MATERIALIZED VIEW "public"."analytics_journeys_aggregated";
CREATE MATERIALIZED VIEW "public"."analytics_journeys_aggregated" AS 
 SELECT a.id AS analytics_id,
    a.flow_id,
    max(a.created_at) AS analytics_created_at,
    string_agg(al.node_title, ', '::text ORDER BY al.created_at) AS node_titles,
    string_agg(al.node_type, ', '::text ORDER BY al.created_at) AS node_types,
    (array_agg(al.node_title ORDER BY al.created_at))[array_upper(array_agg(al.node_title ORDER BY al.created_at), 1)] AS last_node_title
   FROM (analytics a
     LEFT JOIN analytics_logs al ON ((a.id = al.analytics_id)))
  GROUP BY a.id
  ORDER BY a.id;