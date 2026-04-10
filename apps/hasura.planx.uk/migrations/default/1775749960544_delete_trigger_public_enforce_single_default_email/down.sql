CREATE TRIGGER "enforce_single_default_email"
BEFORE INSERT ON "public"."submission_emails"
FOR EACH ROW EXECUTE FUNCTION ensure_single_default_email_per_team();
