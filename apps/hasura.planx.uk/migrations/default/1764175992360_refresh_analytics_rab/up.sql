SELECT cron.schedule(
  'refresh_analytics_rab',
  '30 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_rab$$
);
