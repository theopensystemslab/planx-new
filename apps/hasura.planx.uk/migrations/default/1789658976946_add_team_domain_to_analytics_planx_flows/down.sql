CREATE OR REPLACE VIEW "public"."analytics_planx_flows" AS 
 SELECT f.id AS flow_id,
    f.name AS flow_name,
    f.slug AS flow_slug,
    f.team_id,
    t.slug AS team_slug,
    t.name AS team_name,
    f.created_at,
    f.status,
    flow_first_online_at(f.*) AS first_online_at,
    flow_production_url(f.*) AS url,
    (f.templated_from IS NOT NULL) AS is_templated
   FROM (((flows f
     JOIN teams t ON ((f.team_id = t.id)))
     JOIN team_settings ts ON ((ts.team_id = t.id)))
     JOIN team_integrations ti ON ((ti.team_id = t.id)))
  GROUP BY f.id, f.name, f.slug, f.team_id, t.slug, t.name, f.created_at, f.status, f.templated_from;

GRANT SELECT ON "public"."analytics_planx_flows" TO metabase_read_only;