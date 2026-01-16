SELECT cron.schedule(
  'refresh_analytics_service_overview',
  '35 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_service_overview$$
);
