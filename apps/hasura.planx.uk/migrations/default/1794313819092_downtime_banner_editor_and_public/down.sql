DROP TRIGGER IF EXISTS "set_public_downtime_banner_updated_at" ON "public"."downtime_banner";

ALTER TABLE "public"."downtime_banner" DROP CONSTRAINT IF EXISTS "restrict_to_editor_and_public";

DELETE FROM "public"."downtime_banner" WHERE "name" = 'public';
UPDATE "public"."downtime_banner" SET "name" = 'DowntimeBanner' WHERE "name" = 'editor';

ALTER TABLE "public"."downtime_banner"
  DROP COLUMN IF EXISTS "title",
  DROP COLUMN IF EXISTS "description";

ALTER TABLE "public"."downtime_banner" ALTER COLUMN "name" SET DEFAULT 'DowntimeBanner';
ALTER TABLE "public"."downtime_banner"
  ADD CONSTRAINT "restrict_to_single_row" CHECK ("name" = 'DowntimeBanner');

COMMENT ON TABLE "public"."downtime_banner" IS E'Control whether the <DowntimeBanner /> component is visible, effective immediately without a code deployment';
