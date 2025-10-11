-- drop created_at

ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "created_at";

-- drop updated_at

DROP TRIGGER IF EXISTS "set_public_lowcal_sessions_updated_at" ON "public"."lowcal_sessions";
ALTER TABLE "public"."lowcal_sessions" DROP COLUMN "updated_at";
