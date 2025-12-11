SELECT cron.schedule(
  'refresh_analytics_project_types',
  '25 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_project_types$$
);
