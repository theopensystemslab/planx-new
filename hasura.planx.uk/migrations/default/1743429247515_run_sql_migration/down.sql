-- Previous iteration from hasura.planx.uk/migrations/1742416709742_update_teams_summary_councils_only/up.sql
CREATE OR REPLACE VIEW "public"."teams_summary" AS 
 SELECT t.id,
    t.name,
    t.slug,
    ts.reference_code,
    ts.homepage,
    t.domain AS subdomain,
    ti.has_planning_data AS planning_data_enabled,
    ts.has_article4_schema AS article_4s_enabled,
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
    tt.action_colour,
        CASE
            WHEN ((COALESCE(ti.production_file_api_key, ti.staging_file_api_key) IS NOT NULL) AND (COALESCE(ti.production_power_automate_api_key, ti.staging_power_automate_api_key) IS NOT NULL) AND (ti.power_automate_webhook_url IS NOT NULL)) THEN true
            ELSE false
        END AS power_automate_enabled,
    array_agg(f.name ORDER BY f.name ASC) FILTER (WHERE (f.status = 'online'::text)) AS live_flows
   FROM ((((teams t
     JOIN team_integrations ti ON ((ti.team_id = t.id)))
     JOIN team_themes tt ON ((tt.team_id = t.id)))
     JOIN team_settings ts ON ((ts.team_id = t.id)))
     JOIN flows f ON ((f.team_id = t.id)))
  WHERE t.name not in ('Open Digital Planning','Open Systems Lab','PlanX','Templates','Testing','WikiHouse')
  GROUP BY t.id, t.name, t.slug, ts.reference_code, ts.homepage, ts.help_email, ts.help_phone, ts.email_reply_to_id, ts.help_opening_hours, ts.submission_email, ts.has_article4_schema, ti.has_planning_data, ti.production_govpay_secret, ti.staging_govpay_secret, ti.production_bops_submission_url, ti.staging_bops_submission_url, ti.production_file_api_key, ti.staging_file_api_key, ti.power_automate_webhook_url, ti.production_power_automate_api_key, ti.staging_power_automate_api_key, tt.logo, tt.favicon, tt.primary_colour, tt.link_colour, tt.action_colour
  ORDER BY t.name;
