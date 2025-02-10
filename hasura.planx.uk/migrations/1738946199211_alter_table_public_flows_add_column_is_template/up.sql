alter table "public"."flows" add column "is_template" boolean
 not null default 'false';
