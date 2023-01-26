CREATE TABLE "public"."payment_status" ("session_id" uuid NOT NULL, "payment_id" text NOT NULL, "status" text NOT NULL, "team_slug" text NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("session_id"), FOREIGN KEY ("status") REFERENCES "public"."payment_status_enum"("value") ON UPDATE no action ON DELETE no action, FOREIGN KEY ("team_slug") REFERENCES "public"."teams"("slug") ON UPDATE no action ON DELETE no action);
COMMENT ON TABLE "public"."payment_status" IS E'Session payment status';
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
CREATE TRIGGER "set_public_payment_status_updated_at"
BEFORE UPDATE ON "public"."payment_status"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_payment_status_updated_at" ON "public"."payment_status"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
