alter table "public"."teams" alter column "settings" set default '{"externalPlanningSite": {"url": "https://www.planningportal.co.uk/", "name": "Planning Portal"}}'::jsonb;
