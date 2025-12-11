DROP VIEW "public"."teams_summary";

CREATE OR REPLACE VIEW "public"."teams_summary" AS 
SELECT 
    t.id,
    t.name,
    t.slug,
    ts.reference_code,
    ts.homepage,
    t.domain AS subdomain,
    ti.has_planning_data AS planning_data_enabled,
    ts.has_article4_schema AS article_4s_enabled,
    jsonb_build_object(
      'helpEmail', ts.help_email, 
      'helpPhone', ts.help_phone, 
      'emailReplyToId', ts.email_reply_to_id, 
      'helpOpeningHours', ts.help_opening_hours
    ) AS govnotify_personalisation,
    (ti.staging_govpay_secret IS NOT NULL) AS govpay_enabled_staging,
    (ti.production_govpay_secret IS NOT NULL) AS govpay_enabled_production,
    ts.submission_email AS send_to_email_address,
    ti.staging_bops_submission_url AS bops_submission_url_staging,
    ti.production_bops_submission_url AS bops_submission_url_production,
    tt.logo,
    tt.favicon,
    tt.primary_colour,
    tt.link_colour,
    tt.action_colour,
    (
      (ti.staging_file_api_key IS NOT NULL) AND
      (ti.staging_power_automate_api_key IS NOT NULL) AND
      (ti.power_automate_webhook_url IS NOT NULL)
    )::BOOLEAN AS power_automate_enabled_staging,
    (
      (ti.production_file_api_key IS NOT NULL) AND
      (ti.production_power_automate_api_key IS NOT NULL) AND
      (ti.power_automate_webhook_url IS NOT NULL)
    )::BOOLEAN AS power_automate_enabled_production,
    flow_data.live_flows AS live_flows,
    ts.is_trial
FROM teams t
  JOIN team_integrations ti ON ti.team_id = t.id
  JOIN team_themes tt ON tt.team_id = t.id
  JOIN team_settings ts ON ts.team_id = t.id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', f.name, 
        'firstOnlineAt', public.flow_first_online_at(f)
      ) ORDER BY f.name
    ) AS live_flows
    FROM flows f
    WHERE f.team_id = t.id
      AND f.status = 'online'
      AND f.deleted_at IS NULL
  ) flow_data ON TRUE
WHERE t.name <> ALL (ARRAY['Open Digital Planning', 'Open Systems Lab', 'PlanX', 'Templates', 'Testing', 'WikiHouse'])
ORDER BY t.name;
