alter table "public"."team_integrations" drop column "has_planning_data" cascade;

-- Recreate any views which depended on `has_planning_data`
CREATE OR REPLACE VIEW "public"."teams_summary" AS 
 SELECT t.id,
    t.name,
    t.slug,
    ts.reference_code,
    ts.homepage,
    t.domain AS subdomain,
    ts.has_article4_schema AS article_4s_enabled,
    jsonb_build_object('helpEmail', ts.help_email, 'helpPhone', ts.help_phone, 'emailReplyToId', ts.email_reply_to_id, 'helpOpeningHours', ts.help_opening_hours) AS govnotify_personalisation,
    (ti.staging_govpay_secret IS NOT NULL) AS govpay_enabled_staging,
    (ti.production_govpay_secret IS NOT NULL) AS govpay_enabled_production,
    NULL::text AS send_to_email_address,
    ti.staging_bops_submission_url AS bops_submission_url_staging,
    ti.production_bops_submission_url AS bops_submission_url_production,
    tt.logo,
    tt.favicon,
    tt.primary_colour,
    tt.link_colour,
    tt.action_colour,
    ((ti.staging_file_api_key IS NOT NULL) AND (ti.staging_power_automate_api_key IS NOT NULL) AND (ti.power_automate_webhook_url IS NOT NULL)) AS power_automate_enabled_staging,
    ((ti.production_file_api_key IS NOT NULL) AND (ti.production_power_automate_api_key IS NOT NULL) AND (ti.power_automate_webhook_url IS NOT NULL)) AS power_automate_enabled_production,
    flow_data.live_flows,
    ts.is_trial
   FROM ((((teams t
     JOIN team_integrations ti ON ((ti.team_id = t.id)))
     JOIN team_themes tt ON ((tt.team_id = t.id)))
     JOIN team_settings ts ON ((ts.team_id = t.id)))
     LEFT JOIN LATERAL ( SELECT jsonb_agg(jsonb_build_object('name', f.name, 'firstOnlineAt', flow_first_online_at(f.*)) ORDER BY f.name) AS live_flows
           FROM flows f
          WHERE ((f.team_id = t.id) AND (f.status = 'online'::text) AND (f.archived_at IS NULL))) flow_data ON (true))
  WHERE (t.name <> ALL (ARRAY['Open Digital Planning'::text, 'Open Systems Lab'::text, 'PlanX'::text, 'Templates'::text, 'Testing'::text, 'WikiHouse'::text]))
  ORDER BY t.name;

-- This analytics view may no longer be relevant? To check Metabase later
CREATE OR REPLACE VIEW "public"."analytics_planning_data_teams" AS
  SELECT
    t.id AS team_id,
    t.name AS team_name,
    t.slug AS team_slug,
    ts.reference_code AS planning_data_reference_code,
    ts.is_trial,
    format(
      'https://provide.planning.data.gov.uk/organisations/local-authority:%s' :: text,
      ts.reference_code
    ) AS planning_data_link
  FROM
    (
      (
        teams t
        JOIN team_settings ts ON ((ts.team_id = t.id))
      )
    )
  WHERE
    (ts.reference_code IS NOT NULL);