-- insert teams overwriting conflicts
CREATE TEMPORARY TABLE sync_teams (
  id integer,
  name text,
  slug text,
  created_at timestamptz,
  updated_at timestamptz,
  domain text,
  category text
);

\copy sync_teams FROM '/tmp/teams.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO teams (
  id,
  name,
  slug,
  category
)
SELECT
  id,
  name,
  slug,
  category
FROM sync_teams
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category;

SELECT setval('teams_id_seq', max(id)) FROM teams;
