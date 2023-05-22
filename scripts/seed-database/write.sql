BEGIN;

  -- upsert users
  CREATE TEMPORARY TABLE sync_users (
    id integer,
    first_name text,
    last_name text,
    email text,
    is_admin boolean,
    created_at timestamptz,
    updated_at timestamptz
  );

  \copy sync_users FROM '/tmp/users.csv'  WITH (FORMAT csv, DELIMITER ';');

  INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    is_admin
  )
  SELECT
    id,
    first_name,
    last_name,
    email,
    is_admin
  FROM sync_users
  ON CONFLICT (id) DO NOTHING;

  -- upsert teams
  CREATE TEMPORARY TABLE sync_teams (
    id integer,
    name text,
    slug text,
    theme jsonb,
    created_at timestamptz,
    updated_at timestamptz,
    settings jsonb,
    notify_personalisation jsonb,
    domain text,
    submission_email text
  );

  \copy sync_teams FROM '/tmp/teams.csv' WITH (FORMAT csv, DELIMITER ';');

  INSERT INTO teams (
    id,
    name,
    slug,
    theme,
    settings,
    notify_personalisation,
    domain,
    submission_email
  )
  SELECT
  id,
  name,
  slug,
  theme,
  settings,
  notify_personalisation,
  domain,
  submission_email
  FROM sync_teams
  ON CONFLICT (id) DO NOTHING;


  -- upsert flows
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

  -- overwrite document templates
  TRUNCATE table flow_document_templates;

  \copy flow_document_templates FROM '/tmp/flow_document_templates.csv' WITH (FORMAT csv, DELIMITER ';');

  -- [are published flows useful to migrate?]
  --\copy published_flows (id, data, flow_id, summary, publisher_id) FROM '/tmp/published_flows.csv' WITH (FORMAT csv, DELIMITER ';');

COMMIT;
