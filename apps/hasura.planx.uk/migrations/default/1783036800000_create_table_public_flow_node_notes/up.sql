CREATE TABLE "public"."flow_node_notes" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"flow_id" uuid NOT NULL,
	"node_id" text NOT NULL,
	"placement" text NOT NULL CHECK (placement IN ('attached_to_node', 'attached_to_option', 'after_node', 'before_node')),
	"text" text NOT NULL DEFAULT '',
	"color" text NOT NULL DEFAULT '#fffdb0',
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamptz NOT NULL DEFAULT now(),
	"updated_at" timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY ("id"),
	FOREIGN KEY ("flow_id") REFERENCES "public"."flows" ("id") ON UPDATE RESTRICT ON DELETE CASCADE,
	FOREIGN KEY ("created_by") REFERENCES "public"."users" ("id") ON UPDATE RESTRICT ON DELETE RESTRICT,
	FOREIGN KEY ("updated_by") REFERENCES "public"."users" ("id") ON UPDATE RESTRICT ON DELETE RESTRICT
);
COMMENT ON TABLE "public"."flow_node_notes" IS E'Private sticky notes attached to flow nodes, visible only to team editors';
CREATE INDEX ON "public"."flow_node_notes" ("flow_id");

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

CREATE TRIGGER "set_public_flow_node_notes_updated_at"
BEFORE UPDATE ON "public"."flow_node_notes" FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at" ();
COMMENT ON TRIGGER "set_public_flow_node_notes_updated_at" ON "public"."flow_node_notes" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
