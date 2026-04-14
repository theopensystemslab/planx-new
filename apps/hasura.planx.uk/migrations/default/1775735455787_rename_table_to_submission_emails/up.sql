ALTER TABLE submission_integrations
    RENAME TO submission_emails;

ALTER TABLE "public"."submission_emails" RENAME COLUMN "submission_email" to "address";

ALTER TABLE "public"."submission_emails" RENAME COLUMN "default_email" to "is_default";

ALTER TABLE submission_emails
  RENAME CONSTRAINT submission_integrations_pkey TO submission_emails_pkey;

ALTER TABLE submission_emails
  RENAME CONSTRAINT fk_submission_integrations_team_settings TO fk_submission_emails_team_settings;

DROP TRIGGER "enforce_single_default_email" ON "public"."submission_emails";

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

CREATE TRIGGER enforce_single_default_email
BEFORE INSERT OR UPDATE ON submission_emails
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_email_per_team();
