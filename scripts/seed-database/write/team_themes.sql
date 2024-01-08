-- insert teams_themes overwriting conflicts
CREATE TEMPORARY TABLE sync_team_themes (
  id integer,
  team_id integer,
  primary_colour text,
  secondary_colour text,
  logo text,
  favicon text
);

\copy sync_team_themes FROM '/tmp/team_themes.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  team_themes (
    id,
    team_id,
    primary_colour,
    secondary_colour,
    logo,
    favicon
  )
SELECT
  id,
  team_id,
  primary_colour,
  secondary_colour,
  logo,
  favicon
FROM
  sync_team_themes ON CONFLICT (id) DO
UPDATE
SET
  primary_colour = EXCLUDED.primary_colour,
  secondary_colour = EXCLUDED.secondary_colour,
  logo = EXCLUDED.logo,
  favicon = EXCLUDED.favicon;
SELECT
  setval('team_themes_id_seq', max(id))
FROM
  team_themes;