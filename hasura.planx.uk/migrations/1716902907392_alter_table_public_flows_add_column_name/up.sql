alter table "public"."flows" add column "name" text
 null;
 comment on column "public"."feedback"."node_data" is 'The name of the flow, entered by the user and used to generate the "slug"';
