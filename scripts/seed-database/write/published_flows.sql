CREATE TEMPORARY TABLE sync_published_flows (
  id int,
  data jsonb,
  flow_id uuid,
  summary text,
  publisher_id int
);

\copy sync_published_flows (id, data, flow_id, summary, publisher_id) FROM '/tmp/published_flows.csv' (FORMAT csv, DELIMITER ';');

INSERT INTO published_flows (
  id,
  data,
  flow_id,
  summary,
  publisher_id
)
SELECT
  id,
  data,
  flow_id,
  summary,
  publisher_id
FROM sync_published_flows
ON CONFLICT (id) DO NOTHING;
