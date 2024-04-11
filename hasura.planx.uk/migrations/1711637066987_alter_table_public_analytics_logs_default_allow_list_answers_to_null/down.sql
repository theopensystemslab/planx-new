alter table "public"."analytics_logs" alter column "allow_list_answers" set default '[]'::jsonb;

UPDATE public.analytics_logs SET allow_list_answers = '[]'::jsonb WHERE allow_list_answers IS NULL;
