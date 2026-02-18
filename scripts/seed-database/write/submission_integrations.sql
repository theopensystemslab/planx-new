-- insert submission_integrations overwriting conflicts
CREATE TEMPORARY TABLE sync_submission_integrations (
  team_id integer,
  id uuid,
  submission_email text,
  default_email boolean,
  deleted_at timestamptz
);

\COPY sync_submission_integrations FROM '/tmp/submission_integrations.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  submission_integrations (team_id, id, submission_email, default_email, deleted_at)
SELECT
  team_id integer,
  id uuid,
  submission_email text,
  default_email boolean,
  deleted_at timestamptz
FROM
  sync_submission_integrations ON CONFLICT (id) DO
UPDATE
SET
  team_id = EXCLUDED.team_id,
  submission_email = EXCLUDED.submission_email,
  default_email = EXCLUDED.default_email,
  deleted_at = EXCLUDED.deleted_at;