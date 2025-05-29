alter table "public"."uniform_applications" alter column "create_submission_request_body" drop not null;
alter table "public"."uniform_applications" add column "create_submission_request_body" jsonb;
alter table "public"."uniform_applications" alter column "attach_archive_response" drop not null;
alter table "public"."uniform_applications" add column "attach_archive_response" jsonb;
alter table "public"."uniform_applications" rename column "submission_reference" to "idox_submission_reference";
alter table "public"."uniform_applications" rename column "destination" to "destination_url";
alter table "public"."uniform_applications" rename column "response" to "create_submission_response";
