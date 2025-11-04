DROP MATERIALIZED VIEW "public"."analytics_action_nodes";
CREATE MATERIALIZED VIEW "public"."analytics_action_nodes" AS 
 SELECT a.flow_id,
    a.id AS analytics_id,
    ((al.allow_list_answers -> 'drawBoundary.action'::text))::text AS draw_boundary_action,
    al.node_type,
    al.node_title,
    al.input_errors,
    al.has_clicked_save,
    al.has_clicked_help
   FROM (analytics a
     LEFT JOIN analytics_logs al ON ((a.id = al.analytics_id)))
  WHERE (((al.allow_list_answers -> 'drawBoundary.action'::text) IS NOT NULL) OR (al.has_clicked_save = true) OR (al.has_clicked_help = true));

GRANT SELECT ON TABLE "public"."analytics_action_nodes" TO metabase_read_only;
