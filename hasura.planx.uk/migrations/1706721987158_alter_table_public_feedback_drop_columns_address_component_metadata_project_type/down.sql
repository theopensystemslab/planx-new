alter table "public"."feedback" add column "address" text;

alter table "public"."feedback" add column "project_type" text;

alter table "public"."feedback" add column "component_metadata" jsonb;

