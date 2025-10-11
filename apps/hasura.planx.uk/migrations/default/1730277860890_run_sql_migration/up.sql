CREATE OR REPLACE FUNCTION grant_new_user_template_access() RETURNS trigger AS $$
DECLARE
    templates_team_id INT;
    is_demo_user BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM team_members 
        WHERE user_id = NEW.id 
        AND role = 'demoUser'
    ) INTO is_demo_user;
    
    -- Demo user should not get access as a teamEditor for the templates team...
    IF is_demo_user THEN
        RETURN NULL;
    END IF;
    
    -- ...but all other users should
    SELECT id INTO templates_team_id FROM teams WHERE slug = 'templates';
    IF templates_team_id IS NOT NULL THEN
        INSERT INTO team_members (user_id, team_id, role) 
        VALUES (NEW.id, templates_team_id, 'teamEditor');
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS grant_new_user_template_team_access ON users;

CREATE CONSTRAINT TRIGGER grant_new_user_template_team_access
AFTER INSERT ON users 
DEFERRABLE INITIALLY DEFERRED 
FOR EACH ROW EXECUTE FUNCTION grant_new_user_template_access();

COMMENT ON TRIGGER grant_new_user_template_team_access ON users IS 'Automatically grant all new users teamEditor access to the shared Templates team (apart from users with the demoUser role)';