INSERT INTO flow_integrations (flow_id, team_id)
SELECT f.id, f.team_id
FROM flows f
WHERE f.deleted_at IS NULL
AND f.id NOT IN (
    SELECT flow_id
    FROM flow_integrations
);
