DELETE FROM submission_integrations
WHERE team_id IN (SELECT team_id FROM team_settings)
AND default_email = true;