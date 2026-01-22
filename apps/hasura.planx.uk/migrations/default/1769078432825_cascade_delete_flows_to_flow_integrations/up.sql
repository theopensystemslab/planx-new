ALTER TABLE flow_integrations
DROP CONSTRAINT IF EXISTS fk_flow_integrations_flows,
ADD CONSTRAINT fk_flow_integrations_flows
FOREIGN KEY (flow_id)
REFERENCES flows(id)
ON DELETE CASCADE;
