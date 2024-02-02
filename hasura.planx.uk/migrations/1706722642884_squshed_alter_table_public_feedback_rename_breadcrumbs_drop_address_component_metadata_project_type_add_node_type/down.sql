
alter table "public"."feedback" drop column "node_type";

alter table "public"."feedback" add column "address" text;

alter table "public"."feedback" add column "project_type" text;

alter table "public"."feedback" add column "component_metadata" jsonb;


alter table "public"."feedback" rename column "user_data" to "breadcrumbs";
