SELECT cron.schedule(
  'refresh_analytics_enhancements',
  '35 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_enhancements$$
);
