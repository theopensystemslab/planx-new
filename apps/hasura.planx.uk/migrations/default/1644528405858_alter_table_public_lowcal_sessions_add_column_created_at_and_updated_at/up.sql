-- add created_at

ALTER TABLE "public"."lowcal_sessions" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();

-- add updated_at

ALTER TABLE "public"."lowcal_sessions" ADD COLUMN "updated_at" timestamptz NULL DEFAULT now();

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_lowcal_sessions_updated_at"
BEFORE UPDATE ON "public"."lowcal_sessions"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_lowcal_sessions_updated_at" ON "public"."lowcal_sessions"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
