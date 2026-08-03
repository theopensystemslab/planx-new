CREATE OR REPLACE VIEW "public"."platform_dashboard_stats" AS
WITH lpa_teams AS (
  SELECT id, created_at
  FROM teams
  WHERE name NOT IN ('Open Digital Planning', 'Open Systems Lab', 'PlanX', 'Templates', 'Testing', 'WikiHouse')
),
filtered_flows AS (
  SELECT f.id, f.status
  FROM flows f
  JOIN lpa_teams t ON t.id = f.team_id
  WHERE f.deleted_at IS NULL
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
