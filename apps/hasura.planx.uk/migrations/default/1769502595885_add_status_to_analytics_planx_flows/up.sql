DROP VIEW IF EXISTS public.analytics_planx_flows CASCADE;

CREATE VIEW public.analytics_planx_flows AS (
SELECT
    f.id AS flow_id,
    f.name AS flow_name,
    f.slug AS flow_slug,
    f.team_id,
    t.slug AS team_slug,
    t.name AS team_name,
    f.created_at,
    f.status,
    MIN(a.created_at) AS first_used,
    public.flow_first_online_at(f) AS first_online_at,
    public.flow_production_url(f) AS url
FROM flows f
    JOIN teams t ON f.team_id = t.id
    JOIN team_settings ts ON ts.team_id = t.id
    JOIN team_integrations ti ON ti.team_id = t.id
    LEFT JOIN analytics a ON a.flow_id = f.id
GROUP BY
    f.id,
    f.name,
    f.slug,
    f.team_id,
    t.slug,
    t.name,
    f.created_at,
    f.status,
    public.flow_first_online_at(f),
    public.flow_production_url(f)
);

GRANT SELECT ON public.analytics_planx_flows TO metabase_read_only;