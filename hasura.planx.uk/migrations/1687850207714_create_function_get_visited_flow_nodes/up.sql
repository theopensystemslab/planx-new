CREATE OR REPLACE FUNCTION get_visited_flow_nodes (session_id text) 
    returns jsonb
AS $$
WITH session_summary AS (
        SELECT
            ARRAY(SELECT jsonb_object_keys(data->'breadcrumbs')) AS breadcrumb_keys,
            flow_id
        FROM lowcal_sessions
        WHERE id::text = session_id
    )
    SELECT 
      jsonb_object_agg(node_id, data->node_id) AS visited_published_flow_nodes
    FROM published_flows, jsonb_object_keys(data) AS node_id
    WHERE flow_id = (SELECT flow_id FROM session_summary)
        AND node_id = ANY(ARRAY(SELECT breadcrumb_keys FROM session_summary))
    GROUP BY created_at
    ORDER BY created_at DESC
    LIMIT 1;
$$
LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_visited_flow_nodes IS 'For a lowcal_sessions.id, returns a filtered published_flows.data object containing only the nodes that intersect with the session breadcrumbs.'
