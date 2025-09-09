CREATE TEMPORARY TABLE sync_templated_flow_edits (
  id uuid,
  flow_id uuid,
  data jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

\copy sync_templated_flow_edits from '/tmp/templated_flow_edits.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO 
  templated_flow_edits (
    id,
    flow_id,
    data,
    created_at,
    updated_at
  )
SELECT 
  id,
  flow_id,
  data,
  created_at,
  updated_at
FROM 
  sync_templated_flow_edits ON CONFLICT (id) DO NOTHING;
