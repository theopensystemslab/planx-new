DROP INDEX IF EXISTS analytics_sessions_flow_id_idx
  ON analytics_sessions (flow_id);

DROP INDEX IF EXISTS analytics_sessions_analytics_id_idx
  ON analytics_sessions (analytics_id);
