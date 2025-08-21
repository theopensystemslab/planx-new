-- insert lowcal_sessions overwriting conflicts
CREATE TEMPORARY TABLE sync_lowcal_sessions (
  id uuid,
  data jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  email text,
  flow_id uuid,
  deleted_at timestamptz,
  submitted_at timestamptz,
  has_user_saved boolean,
  sanitised_at timestamptz,
  locked_at timestamptz,
  allow_list_answers jsonb
);

\copy sync_lowcal_sessions FROM '/tmp/lowcal_sessions.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  lowcal_sessions (
    id,
    data,
    created_at,
    updated_at,
    email,
    flow_id,
    deleted_at,
    submitted_at,
    has_user_saved,
    sanitised_at,
    locked_at,
    allow_list_answers
  )
SELECT
  id,
  data,
  created_at,
  updated_at,
  email,
  flow_id,
  deleted_at,
  submitted_at,
  has_user_saved,
  sanitised_at,
  locked_at,
  allow_list_answers
FROM
  sync_lowcal_sessions ON CONFLICT (id) DO
UPDATE
SET
  data = EXCLUDED.data,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at,
  email = EXCLUDED.email,
  flow_id = EXCLUDED.flow_id,
  deleted_at = EXCLUDED.deleted_at,
  submitted_at = EXCLUDED.submitted_at,
  has_user_saved = EXCLUDED.has_user_saved,
  sanitised_at = EXCLUDED.sanitised_at,
  locked_at = EXCLUDED.locked_at,
  allow_list_answers = EXCLUDED.allow_list_answers;

DROP TABLE sync_lowcal_sessions;
