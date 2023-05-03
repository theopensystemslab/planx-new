COMMENT ON COLUMN "public"."lowcal_sessions"."sanitised_at" IS NULL;
ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "sanitised_at";

COMMENT ON COLUMN "public"."session_backups"."sanitised_at" IS NULL;
ALTER TABLE "public"."session_backups" DROP COLUMN "sanitised_at";

COMMENT ON COLUMN "public"."uniform_applications"."sanitised_at" IS NULL;
ALTER TABLE "public"."uniform_applications" DROP COLUMN "sanitised_at";

COMMENT ON COLUMN "public"."bops_applications"."sanitised_at" IS NULL;
ALTER TABLE "public"."bops_applications" DROP COLUMN "sanitised_at";