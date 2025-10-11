alter table "public"."published_flows" add column "is_statutory_application_type" bool;
alter table "public"."published_flows" alter column "is_statutory_application_type" set default false;
alter table "public"."published_flows" alter column "is_statutory_application_type" drop not null;
comment on column "public"."published_flows"."is_statutory_application_type" is E'Snapshots of flow content that are "live" to public users, links to `flows`';
