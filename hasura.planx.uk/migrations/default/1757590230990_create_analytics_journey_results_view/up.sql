DROP MATERIALIZED VIEW IF EXISTS "public"."analytics_journey_results";
CREATE MATERIALIZED VIEW "public"."analytics_journey_results" AS 
SELECT a.id AS analytics_id,
    a.flow_id AS flow_id,
    a.created_at AS analytics_created_at,
    al.created_at AS analytics_log_created_at,
    rf.result_text
FROM analytics a
    LEFT JOIN analytics_logs al ON (a.id = al.analytics_id)
    LEFT JOIN LATERAL (
        SELECT (((al.metadata ->> 'flag'::text))::jsonb ->> 'text'::text) AS result_text
    ) rf ON ((al.metadata ->> 'flag'::text) IS NOT NULL)
WHERE rf.result_text IS NOT NULL
ORDER BY a.id, al.created_at;

GRANT SELECT ON "public"."analytics_journey_results" TO metabase_read_only;