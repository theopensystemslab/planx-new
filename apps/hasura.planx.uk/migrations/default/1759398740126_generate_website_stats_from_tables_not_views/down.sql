CREATE OR REPLACE VIEW "public"."planx_website_stats" AS 
 SELECT ( SELECT count(*) AS count
           FROM ( SELECT analytics_summary.analytics_id,
                    count(*) AS count
                   FROM analytics_summary
                  WHERE ((analytics_summary.analytics_created_at >= (now() + '-30 days'::interval)) AND (analytics_summary.analytics_created_at < now()))
                  GROUP BY analytics_summary.analytics_id
                  ORDER BY analytics_summary.analytics_id) source) AS users_last_30_days,
    ( SELECT count(*) AS count
           FROM submission_services_summary
          WHERE ((submission_services_summary.submitted_at IS NOT NULL) AND (submission_services_summary.submitted_at >= (now() + '-30 days'::interval)) AND (submission_services_summary.submitted_at < now()))) AS submissions_last_30_days,
    ( SELECT count(*) AS count
           FROM (teams t
             JOIN team_settings ts ON ((t.id = ts.team_id)))
          WHERE ((t.slug = ANY (ARRAY['barking-and-dagenham'::text, 'barnet'::text, 'birmingham'::text, 'braintree'::text, 'bromley'::text, 'buckinghamshire'::text, 'camden'::text, 'canterbury'::text, 'doncaster'::text, 'epsom-and-ewell'::text, 'gateshead'::text, 'gloucester'::text, 'horsham'::text, 'kingston'::text, 'lambeth'::text, 'medway'::text, 'newcastle'::text, 'south-gloucestershire'::text, 'southwark'::text, 'st-albans'::text, 'tewkesbury'::text, 'west-berkshire'::text])) AND (ts.is_trial <> true))) AS active_lpas;