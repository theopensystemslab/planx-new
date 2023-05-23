-- insert flows skipping conflicts
CREATE TEMPORARY TABLE sync_flows (
  id uuid,
  team_id int,
  slug text,
  creator_id int,
  data jsonb,
  version int,
  created_at timestamptz,
  updated_at timestamptz,
  settings jsonb,
  copied_from uuid
);

\copy sync_flows FROM '/tmp/flows.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO flows (
  id,
  team_id,
  slug,
  creator_id,
  data,
  version,
  settings,
  copied_from
)
SELECT
  id,
  team_id,
  slug,
  creator_id,
  data,
  version,
  settings,
  copied_from
FROM sync_flows
ON CONFLICT (id) DO NOTHING;

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
FROM flows
ON CONFLICT DO NOTHING;
