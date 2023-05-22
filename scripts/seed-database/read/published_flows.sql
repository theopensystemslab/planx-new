COPY (
  SELECT id, data, flow_id, summary, publisher_id
  FROM (
    SELECT id, data, flow_id, summary, publisher_id, ROW_NUMBER()
    OVER (
      partition BY flow_id ORDER BY created_at DESC
    ) AS row_num
    FROM published_flows
  ) AS subquery
  WHERE row_num <= 1
) TO STDOUT WITH (FORMAT csv, DELIMITER ";");
