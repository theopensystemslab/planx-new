CREATE MATERIALIZED VIEW "public"."analytics_enhancements" AS 
    SELECT analytics_id, (allow_list_answers -> '_enhancements' -> 'proposal.description' -> 'userAction') as user_action
    FROM analytics_logs
    WHERE allow_list_answers ? '_enhancements';

GRANT SELECT ON "public"."analytics_enhancements" TO metabase_read_only; 