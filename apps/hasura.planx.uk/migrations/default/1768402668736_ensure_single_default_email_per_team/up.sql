CREATE OR REPLACE FUNCTION ensure_single_default_email_per_team()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.default_email THEN
    UPDATE submission_integrations
    SET default_email = false
    WHERE team_id = NEW.team_id AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
