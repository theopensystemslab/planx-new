CREATE MATERIALIZED VIEW "public"."analytics_change_metadata" AS
SELECT DISTINCT
    al.analytics_id,
    a.flow_id,
    al.metadata -> 'change' ->> 'type'  AS node_type,
    al.metadata -> 'change' ->> 'title' AS node_title
FROM analytics_logs al
LEFT JOIN analytics a ON al.analytics_id = a.id
WHERE al.metadata -> 'change' IS NOT NULL
  AND al.metadata -> 'change' <> '{}'::jsonb;


SELECT cron.schedule(
  'refresh_analytics_change_metadata',
  '45 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_change_metadata$$
);

GRANT SELECT ON "public"."analytics_change_metadata" TO metabase_read_only;