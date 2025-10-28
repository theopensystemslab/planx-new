-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE FUNCTION lowcal_sessions_lowercase_email() RETURNS trigger AS $lowercase_email$
--     BEGIN
--         NEW.email = LOWER(NEW.email);
--         RETURN NEW;
--     END;
-- $lowercase_email$ LANGUAGE plpgsql;
--
-- CREATE TRIGGER lowcal_sessions_lowercase_email_trigger BEFORE INSERT OR UPDATE ON lowcal_sessions
--     FOR EACH ROW EXECUTE PROCEDURE lowcal_sessions_lowercase_email();

DROP FUNCTION IF EXISTS lowcal_sessions_lowercase_email;
DROP TRIGGER lowcal_sessions_lowercase_email_trigger ON lowcal_sessions;