alter table "public"."feedback" drop column "node_text" cascade;

alter table "public"."feedback" drop column "help_text" cascade;

alter table "public"."feedback" rename column "breadcrumbs" to "user_data";

alter table "public"."feedback" drop column "address" cascade;

alter table "public"."feedback" drop column "component_metadata" cascade;

alter table "public"."feedback" drop column "project_type" cascade;

alter table "public"."feedback" add column "node_type" text
 null;
 
comment on column "public"."feedback"."node_type" is E'The human readable type of the node';
