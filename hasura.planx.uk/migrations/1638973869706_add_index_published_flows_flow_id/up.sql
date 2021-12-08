CREATE INDEX IF NOT EXISTS "flow_id_hash_idx" ON published_flows USING hash(flow_id);
