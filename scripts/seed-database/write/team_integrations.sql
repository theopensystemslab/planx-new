-- insert team_integrations overwriting conflicts
CREATE TEMPORARY TABLE sync_team_integrations (
  id serial,
  team_id integer,
  staging_bops_submission_url text
);

\COPY sync_team_integrations
FROM
  '/tmp/team_integrations.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  team_integrations (id, team_id, staging_bops_submission_url)
SELECT
  id,
  team_id,
  staging_bops_submission_url
FROM
  sync_team_integrations ON CONFLICT (id) DO
UPDATE
SET
  team_id = EXCLUDED.team_id,
  staging_bops_submission_url = EXCLUDED.staging_bops_submission_url;