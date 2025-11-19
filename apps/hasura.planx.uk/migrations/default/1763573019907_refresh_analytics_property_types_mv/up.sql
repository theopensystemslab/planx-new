SELECT cron.schedule(
  'refresh_analytics_property_types',
  '30 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_property_types$$
);
