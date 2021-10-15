COMMENT ON COLUMN "public"."session_backups"."passport" IS E'includes passport and breadcrumb data';
alter table "public"."session_backups" rename column "passport" to "user_data";
