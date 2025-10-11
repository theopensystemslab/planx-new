
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


alter table "public"."teams" drop column "submission_email" cascade;
