comment on column "public"."analytics_logs"."node_fn" is E'Links to `analytics` to provide granular details about user interactions with individual questions';
alter table "public"."analytics_logs" alter column "node_fn" drop not null;
alter table "public"."analytics_logs" add column "node_fn" text;
