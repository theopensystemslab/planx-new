INSERT INTO submission_integrations (team_id, submission_email, default_email)
SELECT 
    ts.team_id,
    ts.submission_email,
    true AS default_email
FROM team_settings ts
WHERE ts.submission_email IS NOT NULL
AND NOT EXISTS (
    SELECT 1 
    FROM submission_integrations si 
    WHERE si.team_id = ts.team_id 
    AND si.submission_email = ts.submission_email
);
