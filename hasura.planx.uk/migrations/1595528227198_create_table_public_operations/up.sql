CREATE TABLE "public"."operations"("id" bigserial NOT NULL, "flow_id" uuid, "version" integer, "actor_id" integer, "data" jsonb NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("flow_id", "version"));
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
CREATE TRIGGER "set_public_operations_updated_at"
BEFORE UPDATE ON "public"."operations"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_operations_updated_at" ON "public"."operations" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
