-- Previous definition from 1696884217237_grant_new_user_template_team_access/up.sql

CREATE OR REPLACE FUNCTION grant_new_user_template_team_access() RETURNS trigger AS $$
DECLARE
    templates_team_id INT;
BEGIN
    SELECT id INTO templates_team_id FROM teams WHERE slug = 'templates';
    IF templates_team_id IS NOT NULL THEN
        INSERT INTO team_members (user_id, team_id, role) VALUES (NEW.id, templates_team_id, 'teamEditor');
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grant_new_user_template_team_access ON users;

CREATE TRIGGER grant_new_user_template_team_access AFTER INSERT ON users
    FOR EACH ROW EXECUTE PROCEDURE grant_new_user_template_team_access();

COMMENT ON TRIGGER grant_new_user_template_team_access ON users
IS 'Automatically grant all new users teamEditor access to the shared Templates team';