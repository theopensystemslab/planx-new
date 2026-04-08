CREATE TABLE "public"."user_pinned_flows" ("user_id" integer NOT NULL, "flow_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("user_id","flow_id") , FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON UPDATE restrict ON DELETE cascade);COMMENT ON TABLE "public"."user_pinned_flows" IS E'Stores custom pinned flows, per user';
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
CREATE TRIGGER "set_public_user_pinned_flows_updated_at"
BEFORE UPDATE ON "public"."user_pinned_flows"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_user_pinned_flows_updated_at" ON "public"."user_pinned_flows"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
