CREATE OR REPLACE FUNCTION check_team_member_limit()
RETURNS trigger AS $$
DECLARE
  member_count INTEGER;
BEGIN
  SELECT COUNT(tm.user_id)
    INTO member_count
    FROM team_members tm
    JOIN users u ON u.id = tm.user_id
   WHERE tm.team_id = NEW.team_id
     AND u.email IS NOT NULL;

  IF member_count >= 20 THEN
    RAISE EXCEPTION
      USING ERRCODE = '22000',
            MESSAGE = 'Team cannot have more than 20 members';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_team_member_limit
BEFORE INSERT OR UPDATE OF team_id ON team_members
FOR EACH ROW
EXECUTE PROCEDURE check_team_member_limit();
