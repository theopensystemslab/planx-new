
alter table "public"."analytics_logs" add column "node_fn" text
 null;

alter table "public"."analytics_logs" add column "allow_list_answers" JSONB
 null default '[]'::jsonb;

comment on column "public"."analytics_logs"."node_fn" is E'The passport variable a node can relate to as stored on the `fn` or `val` of the node';

comment on column "public"."analytics_logs"."allow_list_answers" is E'If the node sets a passport variable deemed as safe to track then any answers are stored in this field';
