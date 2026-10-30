CREATE MATERIALIZED VIEW "public"."analytics_ai_audit_log" AS
SELECT
  created_at,
  flow_id,
  gateway_status,
  guardrail_tripped,
  response_time_ms
FROM ai_gateway_audit_log;

GRANT SELECT ON "public"."analytics_ai_audit_log" TO metabase_read_only;

COMMENT ON MATERIALIZED VIEW "analytics_ai_audit_log" IS 'This table is a reduced materialized view of `ai_gateway_audit_log` table. For user actions saved via allow list answers, see `analytics_enhancements` view. ';

SELECT cron.schedule(
  'refresh_analytics_ai_audit_log',
  '40 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_ai_audit_log$$
);
