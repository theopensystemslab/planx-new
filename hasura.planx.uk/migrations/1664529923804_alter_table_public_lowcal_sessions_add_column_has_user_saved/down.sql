COMMENT ON COLUMN "public"."lowcal_sessions"."has_user_saved" IS NULL;

ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "has_user_saved";
