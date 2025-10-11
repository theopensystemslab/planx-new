CREATE TABLE "public"."global_settings"("id" serial NOT NULL, "footer_content" jsonb NOT NULL DEFAULT jsonb_build_object(), PRIMARY KEY ("id") , UNIQUE ("id"));
