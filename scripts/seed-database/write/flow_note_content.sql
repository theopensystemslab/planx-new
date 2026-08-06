-- insert flow_note_content overwriting conflicts
CREATE TEMPORARY TABLE sync_flow_note_content (
  id uuid,
  text text,
  color text,
  created_by integer,
  updated_by integer,
  created_at timestamptz,
  updated_at timestamptz
);

\copy sync_flow_note_content FROM '/tmp/flow_note_content.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  flow_note_content (id, text, color, created_by, updated_by, created_at, updated_at)
SELECT
  id, 
  text, 
  color, 
  created_by, 
  updated_by, 
  created_at, 
  updated_at
FROM
  sync_flow_note_content ON CONFLICT (id) DO NOTHING;