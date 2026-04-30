CREATE OR REPLACE VIEW "public"."analytics_first_used" AS 
SELECT
  a.flow_id AS flow_id,
  MIN(a.created_at)::date AS first_used_at
FROM
  analytics a
GROUP BY
  a.flow_id;

GRANT SELECT ON "public"."analytics_first_used" TO metabase_read_only;
