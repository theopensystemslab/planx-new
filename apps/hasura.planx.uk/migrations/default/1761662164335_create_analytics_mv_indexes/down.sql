
DROP INDEX IF EXISTS analytics_action_nodes_flow_id_idx
  ON analytics_action_nodes (flow_id);

DROP INDEX IF EXISTS analytics_exits_flow_id_idx
  ON analytics_exits (flow_id);

DROP INDEX IF EXISTS analytics_journeys_aggregated_flow_id_idx
  ON analytics_journeys_aggregated (flow_id);

DROP INDEX IF EXISTS analytics_results_flow_id_idx
  ON analytics_results (flow_id);

DROP INDEX IF EXISTS analytics_sessions_flow_id_idx
  ON analytics_sessions (flow_id);
