CREATE TEMPORARY TABLE sync_service_charge_flow_exceptions (
  flow_id uuid,
  created_at timestamptz
);
\copy sync_service_charge_flow_exceptions FROM '/tmp/service_charge_flow_exceptions.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO service_charge_flow_exceptions (
  flow_id,
  created_at
)
SELECT 
  flow_id,
  created_at
FROM sync_service_charge_flow_exceptions
ON CONFLICT (flow_id) DO UPDATE
SET
  flow_id = EXCLUDED.flow_id,
  created_at = EXCLUDED.created_at;
