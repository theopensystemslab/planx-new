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
  source.id, 
  source.note_id,
  source.flow_id,
  source.node_id,
  source.placement, 
  source.created_by, 
  source.created_at, 
  source.updated_at
FROM
  sync_flow_note_positions AS source
WHERE
  source.note_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM flow_note_content AS content
    WHERE content.id = source.note_id
  )
ON CONFLICT (id) DO NOTHING;