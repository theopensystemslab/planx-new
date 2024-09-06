-- insert teams overwriting conflicts
CREATE TEMPORARY TABLE sync_teams (
  id integer,
  name text,
  slug text,
  created_at timestamptz,
  updated_at timestamptz,
  domain text,
  submission_email text,
  boundary jsonb
);

\copy sync_teams FROM '/tmp/teams.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO teams (
  id,
  name,
  slug,
  boundary
)
SELECT
  id,
  name,
  slug,
  boundary
FROM sync_teams
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  boundary = EXCLUDED.boundary;

SELECT setval('teams_id_seq', max(id)) FROM teams;
