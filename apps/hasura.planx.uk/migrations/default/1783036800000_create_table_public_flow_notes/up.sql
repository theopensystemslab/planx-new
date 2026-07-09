CREATE TABLE "public"."flow_notes" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"flow_id" uuid NOT NULL,
	"node_id" text,
	"placement" jsonb,
	CHECK (
		(node_id IS NOT NULL AND placement IS NULL) OR
		(node_id IS NULL AND placement IS NOT NULL)
	),
	"text" text NOT NULL DEFAULT '',
	"color" text NOT NULL DEFAULT '#fffdb0',
	"created_by" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"created_at" timestamptz NOT NULL DEFAULT now(),
	"updated_at" timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY ("id")
);
COMMENT ON TABLE "public"."flow_notes" IS E'Private sticky notes attached to flow nodes, visible only to team editors';
CREATE INDEX ON "public"."flow_notes" ("flow_id");

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

CREATE TRIGGER "set_public_flow_notes_updated_at"
BEFORE UPDATE ON "public"."flow_notes" FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at" ();
COMMENT ON TRIGGER "set_public_flow_notes_updated_at" ON "public"."flow_notes" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
