comment on column "public"."teams"."submission_email" is E'Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively';
alter table "public"."teams" alter column "submission_email" drop not null;
alter table "public"."teams" add column "submission_email" text;
