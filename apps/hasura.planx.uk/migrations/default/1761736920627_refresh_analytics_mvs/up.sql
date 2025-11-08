SELECT cron.schedule(
  'refresh_analytics_action_nodes',
  '0 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_action_nodes$$
);

SELECT cron.schedule(
  'refresh_analytics_exits',
  '5 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_exits$$
);

SELECT cron.schedule(
  'refresh_analytics_sessions',
  '10 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_sessions$$
);

SELECT cron.schedule(
  'refresh_analytics_results',
  '15 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_results$$
);

SELECT cron.schedule(
  'refresh_analytics_journeys_aggregated',
  '20 3 * * *',
  $$REFRESH MATERIALIZED VIEW analytics_journeys_aggregated$$
);
