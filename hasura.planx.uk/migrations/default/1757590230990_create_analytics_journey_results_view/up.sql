DROP MATERIALIZED VIEW IF EXISTS "public"."analytics_journey_results";
CREATE MATERIALIZED VIEW "public"."analytics_journey_results" AS 
SELECT a.id AS analytics_id,
    a.flow_id AS flow_id,
    max(a.created_at) AS analytics_created_at,
    string_agg(rf.result_text, ', '::text ORDER BY al.created_at) AS results
FROM analytics a
    LEFT JOIN analytics_logs al ON (a.id = al.analytics_id)
    LEFT JOIN LATERAL (
        SELECT (((al.metadata ->> 'flag'::text))::jsonb ->> 'text'::text) AS result_text
    ) rf ON ((al.metadata ->> 'flag'::text) IS NOT NULL)
GROUP BY a.id, a.flow_id
ORDER BY a.id;

GRANT SELECT ON "public"."analytics_journey_results" TO metabase_read_only;
