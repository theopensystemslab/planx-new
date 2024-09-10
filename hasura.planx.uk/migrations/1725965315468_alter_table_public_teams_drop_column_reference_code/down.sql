comment on column "public"."teams"."reference_code" is E'Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively';
alter table "public"."teams" alter column "reference_code" drop not null;
alter table "public"."teams" add column "reference_code" text;
