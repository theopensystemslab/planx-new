alter table "public"."flows" add column "name" text
 null;
 comment on column "public"."flows"."name" is 'The name of the flow, entered by the user and used to generate the "slug"';

UPDATE flows
SET name = replace(concat(upper(substring(slug,1,1)),right(slug,-1)),'-',' ')
WHERE name IS NULL