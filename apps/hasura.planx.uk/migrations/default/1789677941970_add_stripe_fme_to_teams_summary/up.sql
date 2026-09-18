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
    ts.is_trial,
    ((ti.staging_file_api_key IS NOT NULL) AND (ti.staging_power_automate_api_key IS NOT NULL)) AS fme_enabled_staging,
    ((ti.production_file_api_key IS NOT NULL) AND (ti.production_power_automate_api_key IS NOT NULL)) AS fme_enabled_production,
    ti.staging_stripe_account_id AS stripe_connected_staging,
    ti.production_stripe_account_id AS stripe_connected_production,
    ts.payment_provider,
    service_charge_data.total_service_charges_collected
   FROM teams t
     JOIN team_integrations ti ON ti.team_id = t.id
     JOIN team_themes tt ON tt.team_id = t.id
     JOIN team_settings ts ON ts.team_id = t.id
     LEFT JOIN LATERAL (
        SELECT SUM(service_charge_amount) AS total_service_charges_collected 
        FROM service_charges sc 
        WHERE ((sc.team_slug = t.slug))
     ) service_charge_data ON (true)
     LEFT JOIN LATERAL ( 
        SELECT jsonb_agg(jsonb_build_object('name', f.name, 'firstOnlineAt', flow_first_online_at(f.*)) ORDER BY f.name) AS live_flows
        FROM flows f
        WHERE ((f.team_id = t.id) AND (f.status = 'online'::text) AND (f.archived_at IS NULL))
     ) flow_data ON (true)
  WHERE (t.name <> ALL (ARRAY['Open Digital Planning'::text, 'Open Systems Lab'::text, 'PlanX'::text, 'Templates'::text, 'Testing'::text, 'WikiHouse'::text]))
  ORDER BY t.name;
