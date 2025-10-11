CREATE TABLE "public"."lps_magic_links" (
  "token" uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "used_at" timestamptz,
  "operation" text NOT NULL,
  PRIMARY KEY ("token")
);