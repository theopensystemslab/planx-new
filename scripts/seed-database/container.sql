BEGIN;

TRUNCATE TABLE users, teams CASCADE;

\COPY users FROM '/tmp/users.csv' (FORMAT CSV, DELIMITER ';');

\COPY teams (id, name, slug, theme, settings, domain, notify_personalisation) FROM '/tmp/teams.csv' (FORMAT CSV, DELIMITER ';')

\COPY flows FROM '/tmp/flows.csv' (FORMAT CSV, DELIMITER ';');
UPDATE flows SET version = 1;

-- insert an operation for each flow (to make sharedb happy)
INSERT INTO operations (flow_id, data, version) 
  SELECT
    id
  , json_build_object(
      'm', json_build_object(
        'ts', extract(epoch from now()) * 1000
      , 'uId', '1'
      )
      , 'v', 0
      , 'seq', 1
      , 'src', '1'
      , 'create', json_build_object(
        'data', '{}'
        , 'type', 'http://sharejs.org/types/JSONv0'
      )
    )
  , 1
  FROM flows;

\COPY published_flows (id, data, flow_id, summary, publisher_id) FROM '/tmp/published_flows.csv' (FORMAT CSV);

COMMIT;
