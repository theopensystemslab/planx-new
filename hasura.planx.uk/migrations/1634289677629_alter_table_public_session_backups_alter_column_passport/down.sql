COMMENT ON COLUMN "public"."session_backups"."passport" IS E'';
alter table "public"."session_backups" rename column "user_data" to "passport";
