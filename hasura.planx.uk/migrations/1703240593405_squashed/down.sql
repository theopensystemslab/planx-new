COMMENT ON COLUMN "public"."team_themes"."secondary_colour" IS NULL;

COMMENT ON COLUMN "public"."team_themes"."primary_colour" IS NULL;

ALTER TABLE "public"."team_themes" DROP CONSTRAINT "team_themes_team_id_key";

DROP TABLE "public"."team_themes";

ALTER TABLE "public"."teams" ADD COLUMN "theme" JSONB;

ALTER TABLE "public"."teams" ALTER COLUMN "theme" SET DEFAULT '{}'::JSONB;

ALTER TABLE "public"."teams" ALTER COLUMN "theme" DROP NOT NULL;