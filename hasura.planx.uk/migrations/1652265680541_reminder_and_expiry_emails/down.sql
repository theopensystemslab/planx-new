
-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "public"."lowcal_sessions" add column "expiry_date" timestamptz
--  null default now();

ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "expiry_date"

-- alter table "public"."lowcal_sessions" add column "reminder_date" timestamptz
--  null default now();

ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "reminder_date"

-- CREATE OR REPLACE FUNCTION lowcal_sessions_expiry_date() RETURNS trigger AS $generate_expiry_date$
--     BEGIN        
--         NEW.expiry_date = NEW.created_at + INTERVAL '28 days';
--         RETURN NEW;
--     END;
-- $generate_expiry_date$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS lowcal_sessions_expiry_date;

-- CREATE TRIGGER lowcal_sessions_expiry_date_trigger BEFORE INSERT OR UPDATE ON lowcal_sessions
--     FOR EACH ROW EXECUTE PROCEDURE lowcal_sessions_expiry_date();

DROP TRIGGER IF EXISTS lowcal_sessions_expiry_date_trigger ON "public"."lowcal_sessions";

-- CREATE OR REPLACE FUNCTION lowcal_sessions_reminder_date() RETURNS trigger AS $generate_reminder_date$
--     BEGIN        
--         NEW.reminder_date = NEW.created_at + INTERVAL '21 days';
--         RETURN NEW;
--     END;
-- $generate_reminder_date$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS lowcal_sessions_reminder_date;

-- CREATE TRIGGER lowcal_sessions_reminder_date_trigger BEFORE INSERT OR UPDATE ON lowcal_sessions
--     FOR EACH ROW EXECUTE PROCEDURE lowcal_sessions_reminder_date();

DROP TRIGGER IF EXISTS lowcal_sessions_reminder_date_trigger ON "public"."lowcal_sessions";
