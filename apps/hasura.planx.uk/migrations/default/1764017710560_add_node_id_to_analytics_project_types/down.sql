DROP MATERIALIZED VIEW "public"."analytics_project_types";
CREATE MATERIALIZED VIEW "public"."analytics_project_types" AS
SELECT
  analytics_logs.analytics_id,
  analytics_logs.node_title,
  jsonb_array_elements_text(
    (
      (
        analytics_logs.allow_list_answers ->> 'proposal.projectType' :: text
      )
    ) :: jsonb
  ) AS project_type_value
FROM
  analytics_logs
WHERE
  (
    jsonb_typeof(
      (
        (
          analytics_logs.allow_list_answers ->> 'proposal.projectType' :: text
        )
      ) :: jsonb
    ) = 'array' :: text
  )
UNION ALL
SELECT
  analytics_logs.analytics_id,
  analytics_logs.node_title,
  e.value AS project_type_value
FROM
  analytics_logs,
  LATERAL jsonb_each_text(
    (
      (
        analytics_logs.allow_list_answers ->> 'proposal.projectType' :: text
      )
    ) :: jsonb
  ) e(key, value)
WHERE
  (
    jsonb_typeof(
      (
        (
          analytics_logs.allow_list_answers ->> 'proposal.projectType' :: text
        )
      ) :: jsonb
    ) = 'object' :: text
  );

CREATE INDEX IF NOT EXISTS analytics_project_types_analytics_id_idx
  ON analytics_project_types (analytics_id);


GRANT SELECT ON "public"."analytics_project_types" TO metabase_read_only;