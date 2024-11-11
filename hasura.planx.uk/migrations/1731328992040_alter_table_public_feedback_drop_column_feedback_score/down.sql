comment on column "public"."feedback"."feedback_score" is E'A table for storing user feedback on services';
alter table "public"."feedback" alter column "feedback_score" drop not null;
alter table "public"."feedback" add column "feedback_score" text;
