alter table "public"."lowcal_sessions" add column "expiry_date" timestamptz null;

alter table "public"."lowcal_sessions" add column "reminder_date" timestamptz null;

CREATE OR REPLACE FUNCTION lowcal_sessions_expiry_date() RETURNS trigger AS $generate_expiry_date$
    BEGIN        
        NEW.expiry_date = NEW.created_at + INTERVAL '28 days';
        RETURN NEW;
    END;
$generate_expiry_date$ LANGUAGE plpgsql;

CREATE TRIGGER lowcal_sessions_expiry_date_trigger BEFORE INSERT OR UPDATE ON lowcal_sessions
    FOR EACH ROW EXECUTE PROCEDURE lowcal_sessions_expiry_date();

CREATE OR REPLACE FUNCTION lowcal_sessions_reminder_date() RETURNS trigger AS $generate_reminder_date$
    BEGIN        
        NEW.reminder_date = NEW.created_at + INTERVAL '21 days';
        RETURN NEW;
    END;
$generate_reminder_date$ LANGUAGE plpgsql;

CREATE TRIGGER lowcal_sessions_reminder_date_trigger BEFORE INSERT OR UPDATE ON lowcal_sessions
    FOR EACH ROW EXECUTE PROCEDURE lowcal_sessions_reminder_date();