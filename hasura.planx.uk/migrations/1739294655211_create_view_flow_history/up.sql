CREATE OR REPLACE VIEW "public"."flow_history" AS 
WITH timeline AS (
    SELECT
        id,
        flow_id,
        created_at,
        'operation' AS type,
        data,
        null AS comment,
        actor_id
    FROM operations
    WHERE created_at > CURRENT_DATE - INTERVAL '6 months'
UNION
    SELECT
        id,
        flow_id,
        created_at,
        'comment' AS type,
        null AS data,
        comment,
        actor_id
    FROM flow_change_logs
    WHERE created_at > CURRENT_DATE - INTERVAL '6 months'
UNION
    SELECT
        id,
        flow_id,
        created_at,
        'publish' AS type,
        null AS data,
        summary AS comment,
        publisher_id AS actor_id
    FROM published_flows
    WHERE created_at > CURRENT_DATE - INTERVAL '6 months'
)
SELECT
 t.*,
 u.first_name,
 u.last_name
FROM timeline t
LEFT JOIN users u ON t.actor_id = u.id
ORDER BY t.created_at DESC;
