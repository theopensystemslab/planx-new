-- insert teams_themes overwriting conflicts
CREATE TEMPORARY TABLE sync_team_themes (
  id integer,
  team_id integer,
  primary_colour text,
  logo text,
  favicon text,
  link_colour text,
  action_colour text
);

\copy sync_team_themes FROM '/tmp/team_themes.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  team_themes (
    id,
    team_id,
    primary_colour,
    logo,
    favicon,
    link_colour,
    action_colour
  )
SELECT
  id,
  team_id,
  primary_colour,
  logo,
  favicon,
  link_colour,
  action_colour
FROM
  sync_team_themes ON CONFLICT (id) DO
UPDATE
SET
  team_id = EXCLUDED.team_id,
  primary_colour = EXCLUDED.primary_colour,
  logo = EXCLUDED.logo,
  favicon = EXCLUDED.favicon,
  link_colour = EXCLUDED.link_colour,
  action_colour = EXCLUDED.action_colour;
SELECT
  setval('team_themes_id_seq', max(id))
FROM
  team_themes;