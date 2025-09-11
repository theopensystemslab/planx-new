DROP MATERIALIZED VIEW IF EXISTS "public"."analytics_exits";
CREATE MATERIALIZED VIEW "public"."analytics_exits" AS 
SELECT 
    a.id AS analytics_id,
    a.type AS analytics_type,
    last_log.user_exit AS is_user_exit,
    last_log.node_title AS last_node_title,
    last_log.node_type AS last_node_type,
    bool_or(al.has_clicked_save) AS has_clicked_save,
    max((al.allow_list_answers -> 'rab.exitReason'::text)::text) AS positive_exit_reason
FROM analytics a
LEFT JOIN analytics_logs al ON (a.id = al.analytics_id)
LEFT JOIN LATERAL (
    SELECT al2.user_exit, al2.node_title, al2.node_type
    FROM analytics_logs al2 
    WHERE al2.analytics_id = a.id 
    ORDER BY al2.created_at DESC 
    LIMIT 1
) last_log ON true
GROUP BY a.id, a.type, last_log.user_exit, last_log.node_title, last_log.node_type
ORDER BY a.id;

GRANT SELECT ON "public"."analytics_exits" TO metabase_read_only;