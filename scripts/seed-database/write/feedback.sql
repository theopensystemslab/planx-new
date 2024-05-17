-- insert feedback overwriting conflicts
CREATE TEMPORARY TABLE sync_feedback (
  id integer,
  team_id integer,
  flow_id uuid,
  created_at timestamptz,
  node_id text,
  device jsonb,
  user_data jsonb,
  user_context text,
  user_comment text,
  feedback_type text,
  status text,
  node_type text,
  node_data jsonb
);

\copy sync_feedback FROM '/tmp/feedback.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  feedback (
    id,
    team_id,
    flow_id,
    created_at,
    node_id,
    device,
    user_data,
    user_context,
    user_comment,
    feedback_type,
    status,
    node_type,
    node_data
  )
SELECT
  id,
  team_id,
  flow_id,
  created_at,
  node_id,
  device,
  user_data,
  user_context,
  user_comment,
  feedback_type,
  status,
  node_type,
  node_data
FROM
  sync_feedback ON CONFLICT (id) DO
UPDATE
SET
  id = EXCLUDED.id,
  team_id = EXCLUDED.team_id,
  flow_id = EXCLUDED.flow_id,
  created_at = EXCLUDED.created_at,
  node_id = EXCLUDED.node_id,
  device = EXCLUDED.device,
  user_data = EXCLUDED.user_data,
  user_context = EXCLUDED.user_context,
  user_comment = EXCLUDED.user_comment,
  feedback_type = EXCLUDED.feedback_type,
  status = EXCLUDED.status,
  node_type = EXCLUDED.node_type,
  node_data = EXCLUDED.node_data;
SELECT
  setval('feedback_id_seq', max(id))
FROM
  feedback;