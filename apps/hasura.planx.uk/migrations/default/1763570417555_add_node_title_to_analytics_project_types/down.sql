CREATE MATERIALIZED VIEW "public"."analytics_project_types" AS
-- Arrays
SELECT 
  analytics_id,
  jsonb_array_elements_text(
    (allow_list_answers ->> 'proposal.projectType')::jsonb
  ) AS project_type_value
FROM analytics_logs
WHERE jsonb_typeof((allow_list_answers ->> 'proposal.projectType')::jsonb) = 'array'

UNION ALL

-- Objects
SELECT 
  analytics_id,
  e.value AS project_type_value
FROM analytics_logs,
     LATERAL jsonb_each_text((allow_list_answers ->> 'proposal.projectType')::jsonb) AS e
WHERE jsonb_typeof((allow_list_answers ->> 'proposal.projectType')::jsonb) = 'object';

GRANT SELECT ON "public"."analytics_project_types" TO metabase_read_only;
