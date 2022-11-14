CREATE OR REPLACE FUNCTION get_published_flow_version(pf published_flows)
RETURNS INTEGER AS $$
    SELECT max(o.version) FROM operations o
    WHERE o.flow_id = pf.flow_id
    AND o.updated_at < pf.created_at
$$ LANGUAGE sql STABLE;
