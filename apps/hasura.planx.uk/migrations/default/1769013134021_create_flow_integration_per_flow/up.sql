INSERT INTO flow_integrations (flow_id, team_id, email_id)
SELECT DISTINCT ON (f.id)
    f.id AS flow_id,
    f.team_id,
    si.id AS email_id
FROM flows f
LEFT JOIN submission_integrations si 
    ON si.team_id = f.team_id
WHERE NOT EXISTS (
    SELECT 1 
    FROM flow_integrations fi 
    WHERE fi.flow_id = f.id
)
ORDER BY f.id, si.default_email DESC NULLS LAST;
