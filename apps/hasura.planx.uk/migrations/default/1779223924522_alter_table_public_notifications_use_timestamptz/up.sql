ALTER TABLE "public"."notifications"
  ALTER COLUMN "created_at" TYPE timestamptz,
  ALTER COLUMN "resolved_at" TYPE timestamptz;
