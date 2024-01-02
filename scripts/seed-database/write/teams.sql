-- insert teams overwriting conflicts
CREATE TEMPORARY TABLE sync_teams (
  id integer,
  name text,
  slug text,
  -- TODO: Drop this and fetch from team_themes
  theme jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  settings jsonb,
  notify_personalisation jsonb,
  domain text,
  submission_email text,
  boundary jsonb,
  reference_code text
);

\copy sync_teams FROM '/tmp/teams.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO teams (
  id,
  name,
  slug,
  settings,
  notify_personalisation,
  boundary,
  reference_code
)
SELECT
  id,
  name,
  slug,
  settings,
  notify_personalisation,
  boundary,
  reference_code
FROM sync_teams
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  settings = EXCLUDED.settings,
  notify_personalisation = EXCLUDED.notify_personalisation,
  boundary = EXCLUDED.boundary,
  reference_code = EXCLUDED.reference_code;

SELECT setval('teams_id_seq', max(id)) FROM teams;
