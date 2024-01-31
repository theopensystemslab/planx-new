alter table "public"."feedback" add column "node_type" text
 null;
comment on column "public"."feedback"."node_type" is E'The human readable type of the node';
