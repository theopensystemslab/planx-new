CREATE OR REPLACE FUNCTION ensure_single_default_email_per_team()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE submission_emails
    SET is_default = false
    WHERE team_id = NEW.team_id AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
