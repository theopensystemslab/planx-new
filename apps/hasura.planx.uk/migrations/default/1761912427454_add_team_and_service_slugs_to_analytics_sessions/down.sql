DROP MATERIALIZED VIEW "public"."analytics_sessions";
CREATE MATERIALIZED VIEW "public"."analytics_sessions" AS
SELECT
  a.id AS analytics_id,
  a.flow_id,
  max(a.type) AS analytics_type,
  count(DISTINCT al.id) AS number_logs,
  max(
    (
      (
        al.allow_list_answers -> 'application.type' :: text
      ) ->> 0
    )
  ) AS application_type,
  max(a.created_at) AS analytics_created_at,
  max(
    (
      (a.user_agent -> 'platform' :: text) ->> 'type' :: text
    )
  ) AS platform,
  max(((a.user_agent -> 'os' :: text) ->> 'name' :: text)) AS operating_system,
  max(a.referrer) AS referrer,
  bool_or(al.has_clicked_save) AS has_clicked_save,
  string_agg(
    DISTINCT ((al.allow_list_answers -> 'user.role' :: text)) :: text,
    ', ' :: text
    ORDER BY
      ((al.allow_list_answers -> 'user.role' :: text)) :: text
  ) AS user_role
FROM
  (
    analytics a
    LEFT JOIN analytics_logs al ON ((a.id = al.analytics_id))
  )
GROUP BY
  a.id,
  a.flow_id
ORDER BY
  a.id;