DROP MATERIALIZED VIEW IF EXISTS "public"."analytics_exits";
CREATE MATERIALIZED VIEW "public"."analytics_exits" AS
WITH exit_log AS (
	-- Return the last captured log per unique analytics ID
	SELECT DISTINCT ON (analytics_id)
		analytics_id,
		user_exit,
		node_title,
		node_type,
		bool_or(has_clicked_save) as has_clicked_save,
		max((allow_list_answers ->> 'rab.exitReason')::text) AS positive_exit_reason
	FROM analytics_logs
	GROUP BY analytics_id, user_exit, node_title, node_type, created_at
	ORDER BY analytics_id DESC, created_at DESC
) 
SELECT
	a.id AS analytics_id,
	a.type AS analytics_type,
	el.user_exit AS is_user_exit,
	el.node_title AS last_node_title,
	el.node_type AS last_node_type,
	el.has_clicked_save,
	el.positive_exit_reason
FROM analytics a
	JOIN exit_log el ON a.id = el.analytics_id;

GRANT SELECT ON "public"."analytics_exits" TO metabase_read_only;
