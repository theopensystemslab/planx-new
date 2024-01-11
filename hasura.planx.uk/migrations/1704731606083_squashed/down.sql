
comment on column "public"."analytics_logs"."allow_list_answers" is NULL;

comment on column "public"."analytics_logs"."node_fn" is NULL;

alter table "public"."analytics_logs" drop column "node_fn";

alter table "public"."analytics_logs" drop column "allow_list_answers";