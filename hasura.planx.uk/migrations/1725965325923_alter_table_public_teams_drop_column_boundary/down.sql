comment on column "public"."teams"."boundary" is E'Teams are core way we organise `flows` and configure settings like theme colour, logo, and contact info; name usually reflects a council but not exclusively';
alter table "public"."teams" alter column "boundary" set default '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[1.9134116, 49.528423], [1.9134116, 61.331151], [1.9134116, 61.331151], [-10.76418, 61.331151], [-10.76418, 49.528423]]]}, "properties": {}}'::jsonb;
alter table "public"."teams" alter column "boundary" drop not null;
alter table "public"."teams" add column "boundary" jsonb;
