CREATE MATERIALIZED VIEW "public"."analytics_rab" AS
SELECT
  a.id AS analytics_id,
  a.flow_id,
  (al.allow_list_answers -> 'permittedDevelopmentCheck') AS permittedDevelopmentCheck,
  (al.allow_list_answers -> 'project.reportType.multiple') AS "project.reportType.multiple",
  (al.allow_list_answers -> 'report.projectType') AS "report.projectType"
FROM
  analytics a
  LEFT JOIN analytics_logs al ON (a.id = al.analytics_id)
WHERE
  (al.allow_list_answers -> 'permittedDevelopmentCheck') IS NOT NULL
  OR (al.allow_list_answers -> 'project.reportType.multiple') IS NOT NULL
  OR (al.allow_list_answers -> 'report.projectType') IS NOT NULL;

GRANT SELECT on "public"."analytics_rab" TO "metabase_read_only";