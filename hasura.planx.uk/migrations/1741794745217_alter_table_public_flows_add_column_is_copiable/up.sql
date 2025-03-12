alter table "public"."flows" add column "is_copiable" boolean
 not null default 'True';
