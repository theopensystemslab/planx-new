alter table "public"."feedback" add column "node_data" jsonb
 null;

comment on column "public"."feedback"."node_data" is E'The data of the node the user was on when their feedback was left';