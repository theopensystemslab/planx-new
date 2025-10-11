-- Drop current function and trigger
DROP TRIGGER IF EXISTS delete_lowcal_session_scheduled_events_trigger ON lowcal_sessions;
DROP FUNCTION IF EXISTS delete_lowcal_session_scheduled_events;

-- Replace with previous itteration from hasura.planx.uk/migrations/1661380924586_run_sql_migration/up.sql
CREATE OR REPLACE FUNCTION 
	delete_lowcal_session_scheduled_events()
RETURNS TRIGGER AS $$ 
BEGIN
	DELETE FROM hdb_catalog.hdb_scheduled_events 
	WHERE comment IN (
    'reminder_' || OLD.id, 
		'expiry_' || OLD.id 
	);
	RETURN NULL;
END
$$ LANGUAGE plpgsql VOLATILE;

DROP TRIGGER IF EXISTS delete_lowcal_session_scheduled_events_trigger ON lowcal_sessions;
CREATE TRIGGER delete_lowcal_session_scheduled_events_trigger
AFTER DELETE ON lowcal_sessions FOR EACH ROW
EXECUTE PROCEDURE delete_lowcal_session_scheduled_events();

COMMENT ON TRIGGER delete_lowcal_session_scheduled_events_trigger ON lowcal_sessions
IS 'Delete linked scheduled events (reminder and expiry emails) when deleting a lowcal_session';
