alter table "public"."teams" add column "notify_personalisation" jsonb;

alter table "public"."teams" add column "settings" jsonb;
alter table "public"."teams" alter column "settings" set default '{"externalPlanningSite": {"url": "https://www.planningportal.co.uk/", "name": "Planning Portal"}}'::jsonb;

alter table "public"."teams" add column "reference_code" text;
comment on column "public"."teams"."reference_code" is E'Organisation reference code sourced from planning.data.gov.uk/dataset/local-authority';

alter table "public"."teams" add column "boundary" jsonb;
alter table "public"."teams" alter column "boundary" set default '{"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[1.9134116, 49.528423], [1.9134116, 61.331151], [1.9134116, 61.331151], [-10.76418, 61.331151], [-10.76418, 49.528423]]]}, "properties": {}}'::jsonb;
comment on column "public"."teams"."boundary" is E'GeoJSON boundary for team provided by planning.data.gov.uk. Simplified boundary_bbox should generally by used where possible. Defaults to UK extent.';


CREATE OR REPLACE VIEW "public"."teams_summary" AS 
 SELECT t.id,
    t.name,
    t.slug,
    t.reference_code,
    ts.homepage AS homepage,
    t.domain AS subdomain,
    ti.has_planning_data AS planning_data_enabled,
    '@todo'::text AS article_4s_enabled,
    jsonb_build_object('helpEmail', ts.help_email, 'helpPhone', ts.help_phone, 'emailReplyToId', ts.email_reply_to_id, 'helpOpeningHours', ts.help_opening_hours) AS govnotify_personalisation,
        CASE
            WHEN (COALESCE(ti.production_govpay_secret, ti.staging_govpay_secret) IS NOT NULL) THEN true
            ELSE false
        END AS govpay_enabled,
    ts.submission_email AS send_to_email_address,
    COALESCE(ti.production_bops_submission_url, ti.staging_bops_submission_url) AS bops_submission_url,
    tt.logo,
    tt.favicon,
    tt.primary_colour,
    tt.link_colour,
    tt.action_colour
   FROM (((teams t
     JOIN team_integrations ti ON ((ti.team_id = t.id)))
     JOIN team_themes tt ON ((tt.team_id = t.id)))
     JOIN team_settings ts ON ((ts.team_id = t.id)))
  ORDER BY t.name;