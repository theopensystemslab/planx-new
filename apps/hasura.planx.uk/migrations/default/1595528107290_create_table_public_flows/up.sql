CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE "public"."flows"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "team_id" integer NOT NULL, "slug" text NOT NULL, "name" text, "creator_id" integer, "data" jsonb, "version" integer, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE restrict, UNIQUE ("team_id", "slug"));
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
CREATE TRIGGER "set_public_flows_updated_at"
BEFORE UPDATE ON "public"."flows"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_flows_updated_at" ON "public"."flows" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
