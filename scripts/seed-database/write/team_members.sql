CREATE TEMPORARY TABLE sync_team_members (
  id uuid,
  user_id integer,
  team_id integer,
  role text
);

\copy team_members FROM '/tmp/team_members.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  team_members (id, user_id, team_id, role)
SELECT
  id, user_id, team_id, role
FROM
  sync_team_members ON CONFLICT (id) DO UPDATE;