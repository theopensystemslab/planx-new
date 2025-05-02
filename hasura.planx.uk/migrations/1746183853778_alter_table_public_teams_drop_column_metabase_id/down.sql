comment on column "public"."teams"."metabase_id" is E'Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively';
alter table "public"."teams" alter column "metabase_id" drop not null;
alter table "public"."teams" add column "metabase_id" int4;
