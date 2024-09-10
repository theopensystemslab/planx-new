comment on column "public"."teams"."notify_personalisation" is E'Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively';
alter table "public"."teams" alter column "notify_personalisation" drop not null;
alter table "public"."teams" add column "notify_personalisation" jsonb;
