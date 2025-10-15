DELETE FROM team_members
WHERE team_id = 29;

DROP FUNCTION IF EXISTS grant_new_user_template_team_access;
DROP TRIGGER IF EXISTS grant_new_user_template_team_access on users;
