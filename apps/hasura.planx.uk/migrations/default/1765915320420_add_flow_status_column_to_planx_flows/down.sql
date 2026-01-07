CREATE OR REPLACE VIEW public.analytics_planx_flows AS (
SELECT
    f.id AS flow_id,
    f.name AS flow_name,
    f.slug AS flow_slug,
    f.team_id,
    public.flow_first_online_at(f) as first_online_at,
    public.flow_production_url(f) as url
FROM flows f
    JOIN teams t ON f.team_id = t.id
    JOIN team_settings ts ON ts.team_id = t.id
    JOIN team_integrations ti ON ti.team_id = t.id
);

GRANT SELECT ON public.analytics_planx_flows TO metabase_read_only;
