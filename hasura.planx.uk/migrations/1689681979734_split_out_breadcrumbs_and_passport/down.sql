ALTER TABLE "public"."sessions" RENAME COLUMN "breadcrumbs" TO "data";

ALTER TABLE "public"."sessions" ALTER COLUMN "data" SET NOT NULL;

ALTER TABLE "public"."sessions" DROP COLUMN "passport";
