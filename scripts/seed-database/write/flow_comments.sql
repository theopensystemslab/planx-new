CREATE TEMPORARY TABLE sync_flow_comments (
  id integer,
  flow_id uuid,
  actor_id integer,
  comment text,
  created_at timestamptz
);

\copy sync_flow_comments from '/tmp/flow_comments.csv' WITH (FORMAT csv, DELIMITER ';');

INSERT INTO 
  flow_comments (
    id,
    flow_id,
    actor_id,
    comment,
    created_at
  )
SELECT
  id,
  flow_id,
  actor_id,
  comment,
  created_at
FROM 
  sync_flow_comments ON CONFLICT (id) DO NOTHING;

SELECT setval('flow_comments_id_seq', max(id)) FROM flow_comments;
