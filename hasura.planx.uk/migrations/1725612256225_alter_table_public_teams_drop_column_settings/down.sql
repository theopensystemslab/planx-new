comment on column "public"."teams"."settings" is E'Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively';
alter table "public"."teams" alter column "settings" set default '{"externalPlanningSite": {"url": "https://www.planningportal.co.uk/", "name": "Planning Portal"}}'::jsonb;
alter table "public"."teams" alter column "settings" drop not null;
alter table "public"."teams" add column "settings" jsonb;
