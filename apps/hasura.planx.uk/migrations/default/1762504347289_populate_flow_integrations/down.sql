DELETE FROM flow_integrations
WHERE flow_id IN (
    SELECT pf.flow_id 
    FROM published_flows pf
    WHERE pf.has_send_component = true
);