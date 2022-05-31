CREATE OR REPLACE FUNCTION public.get_parent_flows(flow_id text) RETURNS SETOF flows AS $$
    SELECT DISTINCT 
      data.id, 
      data.team_id, 
      data.slug,
      data.creator_id, 
      data.data, 
      data.version, 
      data.created_at, 
      data.updated_at, 
      data.settings
    FROM (
        SELECT f.*, d.value as value
        FROM flows f
        JOIN jsonb_each(f.data) d ON true
    ) data
    WHERE data.value->'type' = '310'
    AND data.value->'data'->>'flowId' = flow_id
$$ LANGUAGE sql STABLE;
