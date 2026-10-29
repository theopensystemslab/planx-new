DROP MATERIALIZED VIEW "public"."analytics_ai_audit_log";
SELECT cron.unschedule('refresh_analytics_ai_audit_log');
