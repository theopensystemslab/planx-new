-- Split flow_notes into a content table  and a positions table. Multiple positions can reference the same content. This makes notes cloneable.

CREATE TABLE "public"."flow_note_content" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"text" text NOT NULL DEFAULT '',
	"color" text NOT NULL DEFAULT '#fffdb0',
	"created_by" integer NOT NULL,
	"updated_by" integer NOT NULL,
	"created_at" timestamptz NOT NULL DEFAULT now(),
	"updated_at" timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY ("id")
);
COMMENT ON TABLE "public"."flow_note_content" IS E'Shared, editable text/colour for a note. A note with more than one flow_note_positions row referencing it is a "clone" - editing this row updates every clone at once.';

CREATE TABLE "public"."flow_note_positions" (
	"id" uuid NOT NULL DEFAULT gen_random_uuid(),
	"note_id" uuid NOT NULL REFERENCES "public"."flow_note_content"("id") ON DELETE RESTRICT,
	"flow_id" uuid NOT NULL,
	"node_id" text,
	"placement" jsonb,
	CHECK (
		(node_id IS NOT NULL AND placement IS NULL) OR
		(node_id IS NULL AND placement IS NOT NULL)
	),
	"created_by" integer NOT NULL,
	"created_at" timestamptz NOT NULL DEFAULT now(),
	"updated_at" timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY ("id")
);
COMMENT ON TABLE "public"."flow_note_positions" IS E'Where a note appears - attached to a node, or placed between nodes. Private, visible only to team editors';
CREATE INDEX ON "public"."flow_note_positions" ("flow_id");
CREATE INDEX ON "public"."flow_note_positions" ("note_id");

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

CREATE TRIGGER "set_public_flow_note_content_updated_at"
BEFORE UPDATE ON "public"."flow_note_content" FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at" ();
COMMENT ON TRIGGER "set_public_flow_note_content_updated_at" ON "public"."flow_note_content" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

CREATE TRIGGER "set_public_flow_note_positions_updated_at"
BEFORE UPDATE ON "public"."flow_note_positions" FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at" ();
COMMENT ON TRIGGER "set_public_flow_note_positions_updated_at" ON "public"."flow_note_positions" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

-- A note is considered deleted once its last position is gone so clean up the orphaned content row
CREATE OR REPLACE FUNCTION "public"."delete_orphaned_flow_note_content"()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "public"."flow_note_content"
  WHERE "id" = OLD."note_id"
  AND NOT EXISTS (
    SELECT 1 FROM "public"."flow_note_positions" WHERE "note_id" = OLD."note_id"
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "delete_orphaned_flow_note_content_trigger"
AFTER DELETE ON "public"."flow_note_positions" FOR EACH ROW
EXECUTE PROCEDURE "public"."delete_orphaned_flow_note_content" ();
COMMENT ON TRIGGER "delete_orphaned_flow_note_content_trigger" ON "public"."flow_note_positions" IS 'deletes a note''s content once no positions reference it anymore';

-- Backfill any existing flow_notes rows (each one becomes one content row
-- and one position row referencing it), then retire the old table.
INSERT INTO "public"."flow_note_content" ("id", "text", "color", "created_by", "updated_by", "created_at", "updated_at")
SELECT "id", "text", "color", "created_by", "updated_by", "created_at", "updated_at" FROM "public"."flow_notes";

INSERT INTO "public"."flow_note_positions" ("note_id", "flow_id", "node_id", "placement", "created_by", "created_at", "updated_at")
SELECT "id", "flow_id", "node_id", "placement", "created_by", "created_at", "updated_at" FROM "public"."flow_notes";

DROP TABLE "public"."flow_notes";
