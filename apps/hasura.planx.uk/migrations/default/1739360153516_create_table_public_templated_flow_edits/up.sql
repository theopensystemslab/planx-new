CREATE TABLE "public"."templated_flow_edits" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "flow_id" uuid NOT NULL,
  "node_id" text NOT NULL,
  "node_data" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON UPDATE restrict ON DELETE cascade,
  UNIQUE ("node_id", "flow_id")
);

COMMENT ON TABLE "public"."templated_flow_edits" IS E'Changes made to a templated flow\'s customisable nodes. These customisations are reconciled with the source template to generate a customised flow.';

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
CREATE TRIGGER "set_public_templated_flow_edits_updated_at"
BEFORE UPDATE ON "public"."templated_flow_edits"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_templated_flow_edits_updated_at" ON "public"."templated_flow_edits"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;
