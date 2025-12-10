CREATE INDEX IF NOT EXISTS analytics_exits_flow_id_idx
  ON analytics_exits (flow_id);

CREATE INDEX IF NOT EXISTS analytics_exits_analytics_id_idx
  ON analytics_exits (analytics_id);
