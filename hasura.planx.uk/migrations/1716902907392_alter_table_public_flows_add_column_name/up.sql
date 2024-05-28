alter table "public"."flows" add column "name" text
 null;
 comment on column "public"."flows"."name" is 'The name of the flow, entered by the user and used to generate the "slug"';

UPDATE flows
SET name = replace(initcap(replace(slug,'-','xax')),'xax',' ')
WHERE name IS NULL


