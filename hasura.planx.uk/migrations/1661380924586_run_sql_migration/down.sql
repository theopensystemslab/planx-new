-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
DROP TRIGGER IF EXISTS delete_lowcal_session_scheduled_events_trigger ON lowcal_sessions;
DROP FUNCTION IF EXISTS delete_lowcal_session_scheduled_events;