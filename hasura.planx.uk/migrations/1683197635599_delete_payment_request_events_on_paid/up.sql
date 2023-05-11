-- function to clean up expiry and reminder emails
DROP FUNCTION IF EXISTS delete_payment_request_scheduled_email_events;

CREATE OR REPLACE FUNCTION delete_payment_request_scheduled_email_events()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM hdb_catalog.hdb_scheduled_events
  WHERE COMMENT IN (
    'payment_reminder_' || OLD.id,
    'payment_reminder_agent_' || OLD.id,
    'payment_expiry_' || OLD.id,
    'payment_expiry_agent_' || OLD.id
  );
  RETURN NULL;
END
$$ LANGUAGE plpgsql VOLATILE;

-- trigger to set up function
DROP TRIGGER IF EXISTS delete_payment_request_scheduled_email_events_trigger ON payment_requests;

CREATE TRIGGER delete_payment_request_scheduled_email_events_trigger
AFTER UPDATE OF paid_at ON payment_requests FOR EACH ROW
WHEN (NEW.paid_at IS NOT NULL)
EXECUTE PROCEDURE delete_payment_request_scheduled_email_events();

COMMENT ON TRIGGER delete_payment_request_scheduled_email_events_trigger ON payment_requests
IS 'Delete scheduled events (reminder and expiry emails) when paid_at is populated';

