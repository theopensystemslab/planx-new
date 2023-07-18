ALTER TABLE "public"."sessions" RENAME COLUMN "data" TO "breadcrumbs";

ALTER TABLE "public"."sessions" ADD COLUMN "passport" jsonb
 NULL;

COMMENT ON COLUMN "public"."sessions"."passport"
  IS E'An representation of collected breadcrumb values';
