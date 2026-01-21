CREATE TRIGGER enforce_single_default_email
BEFORE INSERT OR UPDATE ON submission_integrations
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_email_per_team();
