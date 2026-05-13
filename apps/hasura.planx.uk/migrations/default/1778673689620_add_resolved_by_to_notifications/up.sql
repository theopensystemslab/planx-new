ALTER TABLE "public"."notifications"
  ADD COLUMN "resolved_by" integer REFERENCES "public"."users"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;
