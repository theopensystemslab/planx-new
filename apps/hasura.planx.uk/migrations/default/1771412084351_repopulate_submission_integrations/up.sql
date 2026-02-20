DELETE FROM submission_integrations;

INSERT INTO submission_integrations (team_id, submission_email, default_email)
SELECT 
    ts.team_id,
    ts.submission_email,
    true AS default_email
FROM team_settings ts
WHERE ts.submission_email IS NOT NULL;
