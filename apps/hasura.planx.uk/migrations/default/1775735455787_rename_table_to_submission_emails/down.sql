ALTER TABLE submission_emails
    RENAME TO submission_integrations;

ALTER TABLE "public"."submission_emails" RENAME COLUMN "address" to "submission_email";

ALTER TABLE "public"."submission_emails" RENAME COLUMN "is_default" to "default_email";

ALTER INDEX submission_emails_pkey RENAME TO submission_integrations_pkey;

ALTER TABLE submission_emails
  RENAME CONSTRAINT fk_submission_emails_team_settings TO fk_submission_integrations_team_settings;

CREATE TRIGGER "enforce_single_default_email"
BEFORE INSERT ON "public"."submission_emails"
FOR EACH ROW EXECUTE FUNCTION ensure_single_default_email_per_team();

DROP FUNCTION IF EXISTS ensure_single_default_email_per_team();

DROP TRIGGER IF EXISTS enforce_single_default_email ON submission_integrations;