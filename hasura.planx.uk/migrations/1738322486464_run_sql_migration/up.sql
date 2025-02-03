CREATE OR REPLACE FUNCTION prevent_template_flow_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM flows 
        WHERE templated_from = OLD.id
    ) AND NEW.deleted_at IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot archive a flow template which has children';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_template_flow_deletion
BEFORE UPDATE OF deleted_at ON flows 
FOR EACH ROW
EXECUTE FUNCTION prevent_template_flow_deletion();
