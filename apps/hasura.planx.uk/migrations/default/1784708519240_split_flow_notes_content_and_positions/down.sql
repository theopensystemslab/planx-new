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

CREATE TRIGGER "set_public_flow_notes_updated_at"
BEFORE UPDATE ON "public"."flow_notes" FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at" ();
COMMENT ON TRIGGER "set_public_flow_notes_updated_at" ON "public"."flow_notes" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

-- Reverse backfill: one row per position, carrying its content along. A note cloned into several positions becomes several flow_notes rows again, each with a copy of the content.
INSERT INTO "public"."flow_notes" ("id", "flow_id", "node_id", "placement", "text", "color", "created_by", "updated_by", "created_at", "updated_at")
SELECT p."id", p."flow_id", p."node_id", p."placement", c."text", c."color", p."created_by", c."updated_by", p."created_at", c."updated_at"
FROM "public"."flow_note_positions" p
JOIN "public"."flow_note_content" c ON c."id" = p."note_id";

DROP TABLE "public"."flow_note_positions";
DROP TABLE "public"."flow_note_content";
DROP FUNCTION "public"."delete_orphaned_flow_note_content"();
