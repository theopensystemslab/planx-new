CREATE OR REPLACE FUNCTION delete_pinned_flows_on_archive()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL THEN
    DELETE FROM user_pinned_flows
    WHERE flow_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_pinned_flows_on_archive_trigger
AFTER UPDATE ON flows
FOR EACH ROW
EXECUTE FUNCTION delete_pinned_flows_on_archive();
