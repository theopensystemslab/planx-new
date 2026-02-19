comment on column "public"."published_flows"."submission_email_id" is E'Snapshots of flow content that are "live" to public users, links to `flows`. When adding or removing columns please ensure that the `diff_latest_published_flow` function is also updated';
alter table "public"."published_flows" alter column "submission_email_id" drop not null;
alter table "public"."published_flows" add column "submission_email_id" uuid;
