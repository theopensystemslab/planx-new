CREATE TEMPORARY TABLE sync_analytics (
  id integer,
  type text,
  created_at timestamptz,
  ended_at timestamptz,
  flow_id uuid,
  user_agent jsonb,
  referrer text
);

\copy sync_analytics FROM '/tmp/analytics.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO 
  analytics (
    id,
    type,
    created_at,
    ended_at,
    flow_id,
    user_agent,
    referrer
  )
SELECT
  id,
  type,
  created_at,
  ended_at,
  flow_id,
  user_agent,
  referrer
FROM 
  sync_analytics ON CONFLICT (id) DO 
UPDATE
SET
  id = EXCLUDED.id,
  type = EXCLUDED.type,
  created_at = EXCLUDED.created_at,
  ended_at = EXCLUDED.ended_at,
  flow_id = EXCLUDED.flow_id,
  user_agent = EXCLUDED.user_agent,
  referrer = EXCLUDED.referrer;
SELECT 
  setval('analytics_id_seq', max(id))
FROM analytics;

CREATE TEMPORARY TABLE sync_analytics_logs (
  id integer,
  flow_direction text,
  metadata jsonb,
  created_at timestamptz,
  analytics_id integer,
  user_exit boolean,
  node_type text,
  node_title text,
  has_clicked_help boolean,
  next_log_created_at timestamptz,
  input_errors jsonb,
  node_id text,
  allow_list_answers jsonb,
  has_clicked_save boolean
);

\copy sync_analytics_logs FROM '/tmp/analytics_logs.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO 
  analytics_logs (
    id,
    flow_direction,
    metadata,
    created_at,
    analytics_id,
    user_exit,
    node_type,
    node_title,
    has_clicked_help,
    next_log_created_at,
    input_errors,
    node_id,
    allow_list_answers,
    has_clicked_save
  )
SELECT 
  id,
  flow_direction,
  metadata,
  created_at,
  analytics_id,
  user_exit,
  node_type,
  node_title,
  has_clicked_help,
  next_log_created_at,
  input_errors,
  node_id,
  allow_list_answers,
  has_clicked_save
FROM 
  sync_analytics_logs ON CONFLICT (id) DO
UPDATE
SET 
  id = EXCLUDED.id,
  flow_direction = EXCLUDED.flow_direction,
  metadata = EXCLUDED.metadata,
  created_at = EXCLUDED.created_at,
  analytics_id = EXCLUDED.analytics_id,
  user_exit = EXCLUDED.user_exit,
  node_type = EXCLUDED.node_type,
  node_title = EXCLUDED.node_title,
  has_clicked_help = EXCLUDED.has_clicked_help,
  next_log_created_at = EXCLUDED.next_log_created_at,
  input_errors = EXCLUDED.input_errors,
  node_id = EXCLUDED.node_id,
  allow_list_answers = EXCLUDED.allow_list_answers,
  has_clicked_save = EXCLUDED.has_clicked_save;
SELECT
  setval('analytics_logs_id_seq', max(id))
FROM 
  analytics_logs;
