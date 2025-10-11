alter table "public"."uniform_applications" drop column "create_submission_request_body" cascade;
alter table "public"."uniform_applications" drop column "attach_archive_response" cascade;
comment on column "public"."uniform_applications"."idox_submission_reference" is E'Unique identifier provided by RIPA, must match XML <portaloneapp:RefNum>';
alter table "public"."uniform_applications" rename column "idox_submission_reference" to "submission_reference";
alter table "public"."uniform_applications" rename column "destination_url" to "destination";
alter table "public"."uniform_applications" rename column "create_submission_response" to "response";
