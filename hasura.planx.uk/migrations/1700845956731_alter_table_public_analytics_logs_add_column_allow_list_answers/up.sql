alter table "public"."analytics_logs" add column "allow_list_answers" jsonb
 null default '[]'::jsonb;
