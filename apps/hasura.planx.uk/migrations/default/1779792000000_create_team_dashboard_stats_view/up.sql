CREATE OR REPLACE VIEW "public"."team_dashboard_stats" AS
WITH team_sessions AS (
  SELECT
    f.team_id,
    COUNT(DISTINCT CASE WHEN a.created_at >= now() - INTERVAL '30 days' THEN a.id END) AS sessions_current,
    COUNT(DISTINCT CASE WHEN a.created_at >= now() - INTERVAL '60 days' AND a.created_at < now() - INTERVAL '30 days' THEN a.id END) AS sessions_previous,
    COUNT(DISTINCT CASE WHEN a.created_at >= now() - INTERVAL '30 days' AND f.category = 'guidance' THEN a.id END) AS guidance_sessions_current,
    COUNT(DISTINCT CASE WHEN a.created_at >= now() - INTERVAL '60 days' AND a.created_at < now() - INTERVAL '30 days' AND f.category = 'guidance' THEN a.id END) AS guidance_sessions_previous
  FROM flows f
  JOIN analytics a ON a.flow_id = f.id
  WHERE f.deleted_at IS NULL
  GROUP BY f.team_id
),
team_submissions AS (
  SELECT
    f.team_id,
    COUNT(DISTINCT CASE WHEN ls.submitted_at >= now() - INTERVAL '30 days' THEN ls.id END) AS submissions_current,
    COUNT(DISTINCT CASE WHEN ls.submitted_at >= now() - INTERVAL '60 days' AND ls.submitted_at < now() - INTERVAL '30 days' THEN ls.id END) AS submissions_previous
  FROM flows f
  JOIN lowcal_sessions ls ON ls.flow_id = f.id
  WHERE f.deleted_at IS NULL AND ls.submitted_at IS NOT NULL
  GROUP BY f.team_id
),
online_flows_current AS (
  SELECT team_id, COUNT(*)
  FROM flows
  WHERE status = 'online' AND deleted_at IS NULL
  GROUP BY team_id
),
online_flows_previous AS (
  SELECT f.team_id, COUNT(*)
  FROM flows f
  WHERE f.deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM flow_status_history fsh
      WHERE fsh.flow_id = f.id
        AND fsh.status = 'online'
        AND fsh.event_start <= now() - INTERVAL '30 days'
        AND (fsh.event_end IS NULL OR fsh.event_end >= now() - INTERVAL '30 days')
    )
  GROUP BY f.team_id
)
SELECT
  t.id   AS team_id,
  t.slug AS team_slug,
  COALESCE(ts.sessions_current,           0) AS sessions_current,
  COALESCE(ts.sessions_previous,          0) AS sessions_previous,
  COALESCE(tsub.submissions_current,      0) AS submissions_current,
  COALESCE(tsub.submissions_previous,     0) AS submissions_previous,
  COALESCE(ts.guidance_sessions_current,  0) AS guidance_sessions_current,
  COALESCE(ts.guidance_sessions_previous, 0) AS guidance_sessions_previous,
  COALESCE(ofc.count,                       0) AS online_flows,
  COALESCE(ofp.count,                       0) AS online_flows_previous
FROM teams t
LEFT JOIN team_sessions       ts   ON ts.team_id   = t.id
LEFT JOIN team_submissions    tsub ON tsub.team_id  = t.id
LEFT JOIN online_flows_current ofc ON ofc.team_id  = t.id
LEFT JOIN online_flows_previous ofp ON ofp.team_id = t.id;
