UPDATE team_settings
SET submission_email = teams.submission_email
FROM teams
WHERE team_settings.team_id = teams.id;
