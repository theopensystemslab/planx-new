DROP FUNCTION IF EXISTS delete_payment_request_scheduled_email_events;
CREATE OR REPLACE FUNCTION delete_payment_request_scheduled_email_events()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM hdb_catalog.hdb_scheduled_events
  WHERE comment IN (
    'payment_reminder_' || OLD.id,
    'payment_expiry_' || OLD.id
  );
  RETURN NULL;
END
$$ LANGUAGE plpgsql VOLATILE;

DROP TRIGGER IF EXISTS delete_payment_request_scheduled_email_events_trigger ON payment_requests;
CREATE TRIGGER delete_payment_request_scheduled_email_events_trigger
AFTER UPDATE OF paid_at ON payment_requests FOR EACH ROW
EXECUTE PROCEDURE delete_payment_request_scheduled_email_events();

COMMENT ON TRIGGER delete_payment_request_scheduled_email_events_trigger ON payment_requests
IS 'Delete scheduled events (reminder and expiry emails) when paid_at is populated';

