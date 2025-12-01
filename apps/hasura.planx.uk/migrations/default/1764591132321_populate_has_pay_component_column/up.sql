UPDATE published_flows pf
SET has_pay_component = jsonb_path_exists(data, '$.* ? (@.type == 400)')
FROM (
    SELECT DISTINCT ON (flow_id) id
    FROM published_flows
    ORDER BY flow_id, created_at DESC
) AS latest
WHERE pf.id = latest.id;
