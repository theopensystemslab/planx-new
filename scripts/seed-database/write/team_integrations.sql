-- insert team_integrations overwriting conflicts
CREATE TEMPORARY TABLE sync_team_integrations (
  id serial,
  team_id integer,
  staging_bops_submission_url text,
  staging_bops_secret text,
  has_planning_data boolean,
  staging_govpay_secret text,
  staging_file_api_key text,
  staging_power_automate_api_key text
);

\COPY sync_team_integrations FROM '/tmp/team_integrations.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  team_integrations (id, team_id, staging_bops_submission_url, staging_bops_secret, has_planning_data, staging_govpay_secret, staging_file_api_key, staging_power_automate_api_key)
SELECT
  id,
  team_id,
  staging_bops_submission_url,
  staging_bops_secret,
  has_planning_data,
  staging_govpay_secret,
  staging_file_api_key,
  staging_power_automate_api_key
FROM
  sync_team_integrations ON CONFLICT (id) DO
UPDATE
SET
  team_id = EXCLUDED.team_id,
  staging_bops_submission_url = EXCLUDED.staging_bops_submission_url,
  staging_bops_secret = EXCLUDED.staging_bops_secret,
  has_planning_data = EXCLUDED.has_planning_data,
  staging_govpay_secret = EXCLUDED.staging_govpay_secret,
  staging_file_api_key = EXCLUDED.staging_file_api_key,
  staging_power_automate_api_key = EXCLUDED.staging_power_automate_api_key;
SELECT
  setval('team_integrations_id_seq', max(id))
FROM
  team_integrations;