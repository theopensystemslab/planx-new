UPDATE published_flows pf
SET service_charge_enabled = jsonb_path_exists(data, '$.* ? (@.data.applyServiceCharge == true)')
FROM (
    SELECT DISTINCT ON (flow_id) id
    FROM published_flows
    ORDER BY flow_id, created_at DESC
) AS latest
WHERE pf.id = latest.id;
