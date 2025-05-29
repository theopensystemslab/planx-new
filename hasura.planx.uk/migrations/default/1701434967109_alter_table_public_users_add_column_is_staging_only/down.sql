comment on column "public"."users"."is_staging_only" is NULL;

ALTER TABLE "public"."users" DROP COLUMN "is_staging_only";
