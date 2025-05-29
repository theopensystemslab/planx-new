ALTER TABLE "public"."analytics_logs" ALTER COLUMN "allow_list_answers" drop default;

UPDATE "public"."analytics_logs" SET allow_list_answers = NULL WHERE allow_list_answers = '[]'::jsonb;