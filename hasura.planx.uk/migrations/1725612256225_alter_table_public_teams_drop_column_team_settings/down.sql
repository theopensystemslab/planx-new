alter table "public"."teams" add column "settings" jsonb;
alter table "public"."teams" alter column "settings" set default '{"externalPlanningSite": {"url": "https://www.planningportal.co.uk/", "name": "Planning Portal"}}'::jsonb;
alter table "public"."teams" alter column "settings" drop not null;


alter table "public"."teams" add column "notify_personalisation" jsonb;
alter table "public"."teams" alter column "notify_personalisation" drop not null;

alter table "public"."teams" add column "reference_code" text;
alter table "public"."teams" alter column "reference_code" drop not null;
comment on column "public"."teams"."reference_code" is E"Team name in three letter short form";


alter table "public"."teams" add column "boundary" jsonb;
alter table "public"."teams" alter column "boundary" set default '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[1.9134116, 49.528423], [1.9134116, 61.331151], [1.9134116, 61.331151], [-10.76418, 61.331151], [-10.76418, 49.528423]]]}, "properties": {}}'::jsonb;
alter table "public"."teams" alter column "boundary" drop not null;
comment on column "public"."teams"."boundary" is E"GeoJSON boundary for team provided by planning.data.gov.uk. Simplified boundary_bbox should generally by used where possible. Defaults to UK extent.";