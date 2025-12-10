DROP MATERIALIZED VIEW "public"."analytics_exits";

CREATE MATERIALIZED VIEW "public"."analytics_exits" AS 
    WITH last_node AS (
        SELECT DISTINCT ON (analytics_id)
            analytics_id,
            node_title AS last_node_title,
            node_type AS last_node_type,
            created_at
        FROM analytics_logs
        WHERE (metadata->>'isAutoAnswered')::boolean = FALSE
           OR metadata->>'isAutoAnswered' IS NULL
        ORDER BY analytics_id, created_at DESC
    ),
    exit_node AS (
        SELECT DISTINCT ON (analytics_id)
            analytics_id,
            node_title AS exit_node_title,
            user_exit AS is_user_exit,
            created_at AS exit_created_at
        FROM analytics_logs
        WHERE user_exit = TRUE
        ORDER BY analytics_id, created_at DESC
    ),
    session_summary AS (
        SELECT 
            analytics_id,
            bool_or(has_clicked_save) AS has_clicked_save
        FROM analytics_logs
        GROUP BY analytics_id
    )
    SELECT 
        a.id AS analytics_id,
        a.flow_id,
        a.type AS analytics_type,
        COALESCE(en.is_user_exit, FALSE) AS is_user_exit,
        ln.last_node_title,
        ln.last_node_type,
        ss.has_clicked_save,
        en.exit_node_title
    FROM analytics a
    JOIN last_node ln ON a.id = ln.analytics_id
    LEFT JOIN exit_node en ON a.id = en.analytics_id
    JOIN session_summary ss ON a.id = ss.analytics_id;

GRANT SELECT ON "public"."analytics_exits" TO metabase_read_only; 