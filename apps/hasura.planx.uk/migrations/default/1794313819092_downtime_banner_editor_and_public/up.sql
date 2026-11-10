-- Split the single downtime banner into separate "editor" and "public" banners
ALTER TABLE "public"."downtime_banner" DROP CONSTRAINT "restrict_to_single_row";
ALTER TABLE "public"."downtime_banner" ALTER COLUMN "name" DROP DEFAULT;

ALTER TABLE "public"."downtime_banner"
  ADD COLUMN "title" text NULL DEFAULT 'Partial degradation of some services and features',
  ADD COLUMN "description" text NULL;

-- Existing row becomes the editor banner, public banner inherits current visibility
UPDATE "public"."downtime_banner" SET "name" = 'editor' WHERE "name" = 'DowntimeBanner';

INSERT INTO "public"."downtime_banner" ("name", "is_visible")
SELECT 'public', "is_visible" FROM "public"."downtime_banner" WHERE "name" = 'editor'
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "public"."downtime_banner" ("name") VALUES ('editor'), ('public')
ON CONFLICT ("name") DO NOTHING;

ALTER TABLE "public"."downtime_banner"
  ADD CONSTRAINT "restrict_to_editor_and_public" CHECK ("name" IN ('editor', 'public'));

COMMENT ON TABLE "public"."downtime_banner" IS E'Control the <DowntimeBanner /> components displayed on editor and public routes, effective immediately without a code deployment';
COMMENT ON COLUMN "public"."downtime_banner"."name" IS E'Interface the banner is displayed on - either "editor" or "public"';
COMMENT ON COLUMN "public"."downtime_banner"."title" IS E'Plain text title, displayed in the banner';
COMMENT ON COLUMN "public"."downtime_banner"."description" IS E'Rich text (HTML) displayed in a "More information" modal';

CREATE TRIGGER "set_public_downtime_banner_updated_at"
BEFORE UPDATE ON "public"."downtime_banner"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();

COMMENT ON TRIGGER "set_public_downtime_banner_updated_at" ON "public"."downtime_banner" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
