CREATE TABLE "public"."team_category_enum" (
  "value" TEXT NOT NULL,
  "comment" TEXT,
  PRIMARY KEY ("value")
);

COMMENT ON TABLE "public"."team_category_enum" IS E'An enum for categorising teams, e.g. to exclude non-LPA teams from reporting';

INSERT INTO "public"."team_category_enum" ("value", "comment") VALUES
  ('lpa', 'Local planning authority'),
  ('internal', 'Internal PlanX team, e.g. for testing, templates or training'),
  ('other', 'Other non-LPA organisation');

ALTER TABLE "public"."teams" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'lpa';

ALTER TABLE "public"."teams"
  ADD CONSTRAINT "teams_category_fkey"
  FOREIGN KEY ("category")
  REFERENCES "public"."team_category_enum" ("value")
  ON UPDATE RESTRICT ON DELETE RESTRICT;

COMMENT ON COLUMN "public"."teams"."category" IS E'Whether this team is a local planning authority, an internal PlanX team, or another organisation. Only LPAs are included in LPA-level reporting.';

UPDATE "public"."teams"
SET category = 'internal'
WHERE slug IN (
  'open-digital-planning',
  'opensystemslab',
  'planx',
  'templates',
  'testing',
  'council-onboarding',
  'planx-academy'
);

UPDATE "public"."teams"
SET category = 'other'
WHERE slug IN (
  'environment-agency',
  'historic-england',
  'planning-advisory-service-pas',
  'tpx',
  'wikihouse'
);

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
  WHERE t.category = 'lpa'
  ORDER BY t.name;

CREATE OR REPLACE VIEW "public"."platform_dashboard_stats" AS
WITH lpa_teams AS (
  SELECT t.id, t.created_at
  FROM teams t
  JOIN team_settings ts ON ts.team_id = t.id
  WHERE t.category = 'lpa'
    AND COALESCE(ts.is_trial, false) = false
),
filtered_flows AS (
  SELECT f.id, f.status
  FROM flows f
  JOIN lpa_teams t ON t.id = f.team_id
  WHERE f.archived_at IS NULL
),
platform_sessions AS (
  SELECT
    COUNT(CASE WHEN a.created_at >= now() - INTERVAL '30 days' THEN a.id END) AS sessions_current,
    COUNT(CASE WHEN a.created_at >= now() - INTERVAL '60 days' AND a.created_at < now() - INTERVAL '30 days' THEN a.id END) AS sessions_previous
  FROM filtered_flows f
  JOIN analytics a ON a.flow_id = f.id
  WHERE a.created_at >= now() - INTERVAL '60 days'
),
platform_submissions AS (
  SELECT
    COUNT(CASE WHEN ls.submitted_at >= now() - INTERVAL '30 days' THEN ls.id END) AS submissions_current,
    COUNT(CASE WHEN ls.submitted_at >= now() - INTERVAL '60 days' AND ls.submitted_at < now() - INTERVAL '30 days' THEN ls.id END) AS submissions_previous
  FROM filtered_flows f
  JOIN lowcal_sessions ls ON ls.flow_id = f.id
  WHERE ls.submitted_at IS NOT NULL AND ls.submitted_at >= now() - INTERVAL '60 days'
),
online_flows_current AS (
  SELECT COUNT(*) AS count
  FROM filtered_flows
  WHERE status = 'online'
),
online_flows_previous AS (
  SELECT COUNT(*) AS count
  FROM filtered_flows f
  WHERE EXISTS (
    SELECT 1 FROM flow_status_history fsh
    WHERE fsh.flow_id = f.id
      AND fsh.status = 'online'
      AND fsh.event_start <= now() - INTERVAL '30 days'
      AND (fsh.event_end IS NULL OR fsh.event_end >= now() - INTERVAL '30 days')
  )
),
lpas_current AS (
  SELECT COUNT(*) AS count FROM lpa_teams
),
lpas_previous AS (
  SELECT COUNT(*) AS count FROM lpa_teams WHERE created_at <= now() - INTERVAL '30 days'
)
SELECT
  COALESCE(lc.count, 0)   AS lpas_current,
  COALESCE(lp.count, 0)   AS lpas_previous,
  COALESCE(ofc.count, 0)  AS online_flows_current,
  COALESCE(ofp.count, 0)  AS online_flows_previous,
  COALESCE(ps.sessions_current, 0)      AS sessions_current,
  COALESCE(ps.sessions_previous, 0)     AS sessions_previous,
  COALESCE(psub.submissions_current, 0) AS submissions_current,
  COALESCE(psub.submissions_previous, 0) AS submissions_previous
FROM lpas_current lc
CROSS JOIN lpas_previous lp
CROSS JOIN online_flows_current ofc
CROSS JOIN online_flows_previous ofp
CROSS JOIN platform_sessions ps
CROSS JOIN platform_submissions psub;
