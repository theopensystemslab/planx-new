CREATE TABLE "public"."team_settings" ("id" serial NOT NULL, 
"team_id" integer NOT NULL, 
"reference_code" text, 
"homepage" text, 
"help_email" text NOT NULL DEFAULT 'example@council.gov.uk', 
"help_phone" text NOT NULL DEFAULT '(01234) 567890', 
"help_opening_hours" text NOT NULL DEFAULT 'Monday - Friday, 9am - 5pm', 
"email_reply_to_id" text NOT NULL DEFAULT '727d48fa-cb8a-42f9-b8b2-55032f3bb451', 
"has_planning_data" boolean NOT NULL DEFAULT False, 
"external_planning_site_url" text DEFAULT 'https://www.planningportal.co.uk/', 
"external_planning_site_name" text DEFAULT 'Planning Portal',
"boundary_url" text,  
"boundary_json" jsonb NOT NULL DEFAULT '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[1.9134116, 49.528423], [1.9134116, 61.331151], [1.9134116, 61.331151], [-10.76418, 61.331151], [-10.76418, 49.528423]]]}, "properties": {}}'::jsonb,
PRIMARY KEY ("id") , 
FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE cascade ON DELETE cascade, 
UNIQUE ("id"), UNIQUE ("team_id"), UNIQUE ("reference_code"));
COMMENT ON TABLE "public"."team_settings" IS E'Global settings for boundary and contact details';

comment on column "public"."team_settings"."reference_code" is E'Team name in three letter short form';
comment on column "public"."team_settings"."team_id" is E'Linked ID to Teams table';
comment on column "public"."team_settings"."help_phone" is E'For use in gov notify emails';
comment on column "public"."team_settings"."help_email" is E'For use in gov notify emails';
comment on column "public"."team_settings"."help_opening_hours" is E'For use in gov notify emails';
comment on column "public"."team_settings"."email_reply_to_id" is E'Generate by gov notify and relates to the "reply to" address in notifications';
comment on column "public"."team_settings"."boundary_url" is E'User entered boundary linked to https://www.planning.data.gov.uk/';
comment on column "public"."team_settings"."boundary_json" is E'Long form boundary geojson - used to compute boundary_bbox';
