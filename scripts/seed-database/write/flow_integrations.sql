-- insert flow_integrations overwriting conflicts
CREATE TEMPORARY TABLE sync_flow_integrations (
  flow_id uuid,
  team_id integer,
  email_id uuid
);

\COPY sync_flow_integrations FROM '/tmp/flow_integrations.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO
  flow_integrations (flow_id, team_id, email_id)
SELECT
  flow_id uuid,
  team_id integer,
  email_id uuid
FROM
  sync_flow_integrations ON CONFLICT (flow_id) DO
UPDATE
SET
  team_id = EXCLUDED.team_id,
  email_id = EXCLUDED.email_id;