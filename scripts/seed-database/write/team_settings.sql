-- insert teams_settings overwriting conflicts
CREATE TEMPORARY TABLE sync_team_settings (
  id integer,
  team_id integer,
  reference_code text,
  homepage text,
  help_email text,
  help_phone text,
  help_opening_hours text,
  email_reply_to_id text,
  external_planning_site_url text,
  external_planning_site_name text,
  boundary_json jsonb,
  boundary_url text
);

\copy sync_team_settings FROM '/tmp/team_settings.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  team_themes (
    id,
    team_id,
    reference_code,
    homepage,
    help_email,
    help_phone,
    help_opening_hours,
    email_reply_to_id,
    external_planning_site_url,
    external_planning_site_name,
    boundary_json,
    boundary_url
  )
SELECT
    id,
    team_id,
    reference_code,
    homepage,
    help_email,
    help_phone,
    help_opening_hours,
    email_reply_to_id,
    external_planning_site_url,
    external_planning_site_name,
    boundary_json,
    boundary_url
FROM
  sync_team_settings ON CONFLICT (id) DO
UPDATE
SET
    team_id = EXCLUDED.team_id,
    reference_code = EXCLUDED.reference_code,
    homepage = EXCLUDED.homepage,
    help_email = EXCLUDED.help_email,
    help_phone = EXCLUDED.help_phone,
    help_opening_hours = EXCLUDED.help_opening_hours,
    email_reply_to_id = EXCLUDED.email_reply_to_id,
    external_planning_site_url = EXCLUDED.external_planning_site_url,
    external_planning_site_name = EXCLUDED.external_planning_site_name,
    boundary_json = EXCLUDED.boundary_json,
    boundary_url = EXCLUDED.boundary_url;
SELECT
  setval('team_settings_id_seq', max(id))
FROM
  team_settings;