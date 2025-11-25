-- insert flows overwriting conflicts
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
  copied_from uuid,
  status text,
  name text,
  description text,
  templated_from uuid,
  summary varchar(120),
  limitations text,
  is_template boolean,
  deleted_at timestamptz,
  can_create_from_copy boolean,
  is_listed_on_lps boolean,
  category text
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
  copied_from,
  status,
  name,
  description,
  templated_from,
  summary,
  limitations,
  is_template,
  deleted_at,
  can_create_from_copy,
  is_listed_on_lps,
  category
)
SELECT
  id,
  team_id,
  slug,
  creator_id,
  data,
  version,
  settings,
  copied_from,
  status,
  name,
  description,
  templated_from,
  summary,
  limitations,
  is_template,
  deleted_at,
  can_create_from_copy,
  is_listed_on_lps,
  category
FROM sync_flows
ON CONFLICT (id) DO UPDATE
SET
  team_id = EXCLUDED.team_id,
  slug = EXCLUDED.slug,
  creator_id = EXCLUDED.creator_id,
  data = EXCLUDED.data,
  version = EXCLUDED.version,
  settings = EXCLUDED.settings,
  copied_from = EXCLUDED.copied_from,
  status = EXCLUDED.status,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  templated_from = EXCLUDED.templated_from,
  summary = EXCLUDED.summary,
  limitations = EXCLUDED.limitations,
  is_template = EXCLUDED.is_template,
  deleted_at = EXCLUDED.deleted_at,
  can_create_from_copy = EXCLUDED.can_create_from_copy,
  category = EXCLUDED.category;

-- ensure that original flows.version is overwritten to match new operation inserted below, else sharedb will fail
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
FROM flows
ON CONFLICT DO NOTHING;
