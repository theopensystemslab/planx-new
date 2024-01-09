alter table "public"."lowcal_sessions" add column "allow_list_answers" json null;
comment on column "public"."lowcal_sessions"."allow_list_answers" is E'Non-personal passport answers that can be retained for analytics post-sanitation; updated via cron trigger after submission';
