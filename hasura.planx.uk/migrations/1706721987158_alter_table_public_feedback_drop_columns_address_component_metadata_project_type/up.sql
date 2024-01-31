
alter table "public"."feedback" drop column "address" cascade;

alter table "public"."feedback" drop column "component_metadata" cascade;

alter table "public"."feedback" drop column "project_type" cascade;
