DELETE FROM flow_integrations;

INSERT INTO flow_integrations (flow_id, team_id, email_id)
SELECT DISTINCT
    pf.flow_id,
    f.team_id,
    si.id
FROM published_flows pf
INNER JOIN flows f ON pf.flow_id = f.id
LEFT JOIN submission_integrations si ON f.team_id = si.team_id AND si.default_email = true
WHERE pf.has_send_component = true
    AND f.deleted_at IS NULL;
