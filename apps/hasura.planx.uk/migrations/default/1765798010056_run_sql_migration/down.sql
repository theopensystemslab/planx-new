REVOKE EXECUTE ON FUNCTION public.flow_first_online_at(flows) FROM metabase_read_only;
REVOKE EXECUTE ON FUNCTION public.flow_production_url(flows) FROM metabase_read_only;
REVOKE SELECT ON public.analytics_planx_flows FROM metabase_read_only;

DROP VIEW IF EXISTS public.analytics_planx_flows;
