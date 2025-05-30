CREATE TABLE "public"."sessions" (
    "id" uuid NOT NULL,
    "data" jsonb NOT NULL,
    "email" text NOT NULL,
    "flow_id" uuid NOT NULL,
    "has_user_saved" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "locked_at" timestamptz,
    "submitted_at" timestamptz,
    "deleted_at" timestamptz,
    "sanitised_at" timestamptz,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("flow_id")
  REFERENCES "public"."flows"("id")
  ON UPDATE no action
  ON DELETE restrict
);

CREATE OR REPLACE FUNCTION sessions_lowercase_email() RETURNS trigger AS
$lowercase_email$
BEGIN
  NEW.email = LOWER(NEW.email);
  RETURN NEW;
END;
$lowercase_email$ LANGUAGE plpgsql;

CREATE TRIGGER "set_sessions_email_to_lowercase" BEFORE INSERT OR UPDATE ON sessions
    FOR EACH ROW EXECUTE PROCEDURE sessions_lowercase_email();

CREATE TRIGGER "set_public_sessions_updated_at" BEFORE UPDATE ON "public"."sessions"
  FOR EACH ROW EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();

COMMENT ON TRIGGER "set_sessions_email_to_lowercase" ON "public"."sessions"
  IS 'trigger to normalize emails to lowercase on change';

COMMENT ON TRIGGER "set_public_sessions_updated_at" ON "public"."sessions"
  IS 'trigger to set value of column "updated_at" to current timestamp on row update';

COMMENT ON COLUMN "public"."sessions"."data"
  IS E'An ordered array of breadcrumbs';

COMMENT ON COLUMN "public"."sessions"."email"
  IS E'Applicant email address used for save-and-return';

COMMENT ON COLUMN "public"."sessions"."flow_id"
  IS E'A reference to the session\'s flow';

COMMENT ON COLUMN "public"."sessions"."locked_at"
  IS E'Tracks if the session is read-only (e.g when a nominated payment has been initiated)';

COMMENT ON COLUMN "public"."sessions"."submitted_at"
  IS E'Tracks if a session has been submitted to send destinations';

COMMENT ON COLUMN "public"."sessions"."deleted_at"
  IS E'Tracks if a session has been soft deleted';

COMMENT ON COLUMN "public"."sessions"."sanitised_at"
  IS E'Tracks if personal data has been sanitised from record';

COMMENT ON COLUMN "public"."sessions"."has_user_saved"
  IS E'Tracks if email reminder and expiry events have been setup for session';

COMMENT ON TABLE "public"."sessions"
  IS E'Stores a representation of a user\'s session data as an ordered array of breadcrumbs';
