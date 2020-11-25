CREATE OR REPLACE FUNCTION default_flow_slug() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF (NEW.slug IS NULL) THEN
      NEW.slug = NEW.id;
    END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_slug_default_val_to_id
BEFORE INSERT ON flows
FOR EACH ROW EXECUTE PROCEDURE default_flow_slug();
