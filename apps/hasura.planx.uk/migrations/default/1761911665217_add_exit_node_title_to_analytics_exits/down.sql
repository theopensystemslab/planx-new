DROP MATERIALIZED VIEW "public"."analytics_exits";
CREATE MATERIALIZED VIEW "public"."analytics_exits" AS WITH exit_log AS (
  SELECT
    DISTINCT ON (analytics_logs.analytics_id) analytics_logs.analytics_id,
    analytics_logs.user_exit,
    analytics_logs.node_title,
    analytics_logs.node_type,
    bool_or(analytics_logs.has_clicked_save) AS has_clicked_save,
    max(
      (
        analytics_logs.allow_list_answers ->> 'rab.exitReason' :: text
      )
    ) AS positive_exit_reason
  FROM
    analytics_logs
  GROUP BY
    analytics_logs.analytics_id,
    analytics_logs.user_exit,
    analytics_logs.node_title,
    analytics_logs.node_type,
    analytics_logs.created_at
  ORDER BY
    analytics_logs.analytics_id DESC,
    analytics_logs.created_at DESC
)
SELECT
  a.id AS analytics_id,
  a.flow_id,
  a.type AS analytics_type,
  el.user_exit AS is_user_exit,
  el.node_title AS last_node_title,
  el.node_type AS last_node_type,
  el.has_clicked_save,
  el.positive_exit_reason
FROM
  (
    analytics a
    JOIN exit_log el ON ((a.id = el.analytics_id))
  );