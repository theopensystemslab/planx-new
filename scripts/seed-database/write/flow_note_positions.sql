-- insert flow_note_positions overwriting conflicts
CREATE TEMPORARY TABLE sync_flow_note_positions (
  id uuid,
  note_id uuid,
  flow_id uuid,
  node_id text,
  placement jsonb,
  created_by integer,
  created_at timestamptz,
  updated_at timestamptz
);

\copy sync_flow_note_positions FROM '/tmp/flow_note_positions.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  flow_note_positions (id, note_id, flow_id, node_id, placement, created_by, created_at, updated_at)
SELECT
  id, 
  note_id,
  flow_id,
  node_id,
  placement, 
  created_by, 
  created_at, 
  updated_at
FROM
  sync_flow_note_positions ON CONFLICT (id) DO NOTHING;