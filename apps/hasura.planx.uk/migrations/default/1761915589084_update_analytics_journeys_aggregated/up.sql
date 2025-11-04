DROP MATERIALIZED VIEW "public"."analytics_journeys_aggregated";
CREATE MATERIALIZED VIEW "public"."analytics_journeys_aggregated" AS 
 SELECT a.id AS analytics_id,
    a.flow_id,
    max(a.type) AS analytics_type,
    max(a.created_at) AS analytics_created_at,
    string_agg(al.node_title, ', '::text ORDER BY al.created_at) AS node_titles,
    string_agg(al.node_type, ', '::text ORDER BY al.created_at) AS node_types,
    (array_agg(al.node_title ORDER BY al.created_at))[array_upper(array_agg(al.node_title ORDER BY al.created_at), 1)] AS last_node_title,
    bool_or(al.has_clicked_save) AS has_clicked_save,
    max(
      (
        (
          al.allow_list_answers -> 'application.type' :: text
        ) ->> 0
      )
    ) AS application_type
   FROM (analytics a
     LEFT JOIN analytics_logs al ON ((a.id = al.analytics_id)))
  GROUP BY a.id, a.flow_id
  ORDER BY a.id;

GRANT SELECT ON public.analytics_journeys_aggregated TO metabase_read_only;