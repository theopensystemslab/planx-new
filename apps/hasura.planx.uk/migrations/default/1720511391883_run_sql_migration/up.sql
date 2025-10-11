CREATE OR REPLACE VIEW "public"."teams_summary" AS SELECT 
    t.id,
    t.name,
    t.slug,
    t.reference_code,
    t.settings->>'homepage' as homepage,
    t.domain as subdomain,
    ti.has_planning_data as planning_data_enabled,
    '@todo' as article_4s_enabled,  
    jsonb_build_object(
        'helpEmail', ts.help_email,
        'helpPhone', ts.help_phone,
        'emailReplyToId', ts.email_reply_to_id,
        'helpOpeningHours', ts.help_opening_hours
        ) as govnotify_personalisation,
    CASE 
        WHEN coalesce(ti.production_govpay_secret, ti.staging_govpay_secret) is not null 
        THEN true
        ELSE false
    END as govpay_enabled,
    t.submission_email as send_to_email_address,
    coalesce(ti.production_bops_submission_url, ti.staging_bops_submission_url) as bops_submission_url,
    tt.logo,
    tt.favicon,
    tt.primary_colour,
    tt.link_colour,
    tt.action_colour
FROM teams t
    JOIN team_integrations ti on ti.team_id = t.id
    JOIN team_themes tt on tt.team_id = t.id
    JOIN team_settings ts on ts.team_id = t.id
ORDER BY t.name ASC;
