DROP TRIGGER IF EXISTS "set_sessions_email_to_lowercase" ON "public"."sessions";
DROP TRIGGER IF EXISTS "set_public_sessions_updated_at" ON "public"."sessions";
DROP TABLE "public"."sessions" CASCADE;
