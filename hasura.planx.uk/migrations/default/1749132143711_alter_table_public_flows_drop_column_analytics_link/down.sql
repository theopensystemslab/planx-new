comment on column "public"."flows"."analytics_link" is E'Flows represent the core services, and changes to the flow content are tracked in `operations`';
alter table "public"."flows" alter column "analytics_link" drop not null;
alter table "public"."flows" add column "analytics_link" text;
