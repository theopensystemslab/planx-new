-- Denormalizes portals
-- That is, it merges nodes and edges from a portal's flow into the main flow (recursively)
CREATE FUNCTION compile_flow_portals(flow_row flows)
RETURNS jsonb
LANGUAGE plpgsql STABLE AS $$
DECLARE
  _nodes jsonb;
  _edges jsonb;
  _portals_processed text[];
  _key text;
  _value jsonb;
  _tmp jsonb;
  _id text;
  _count int;
BEGIN
  _nodes := flow_row.data->'nodes';
  _edges := flow_row.data->'edges';

  -- Initialise outer loop
  _count := 1;

  -- Loop until there are no more new portals
  -- Would've preferred to use recursion but https://stackoverflow.com/questions/23494361/recursive-function-in-postgres#comment50673363_23979656
  WHILE _count > 0 LOOP
    _count := 0;

    FOR _key, _value IN SELECT * FROM jsonb_each(_nodes) LOOP

      -- Need to TRIM because JSON TEXT is always double-quoted
      -- i.e. (('{"key":"value"}'::jsonb)->'key')::text = '"value"'
      _id := TRIM('"' FROM (_value->'flowId')::TEXT);

      -- Ignore non-portals and non-external portals
      IF ((_value->'$t')::int <> 300) OR (_value->'flowId' IS NULL) THEN
        CONTINUE;
      END IF;

      -- Ignore already processed portals
      IF (_id = ANY(_portals_processed)) THEN
        CONTINUE;
      END IF;
      _portals_processed = _portals_processed || ARRAY[_id];

      -- This branch means "found new portal,"
      -- in which case we inform the outer loop to do (at least) one more cycle
      -- to check if the present new portal's flow contains further portals
      _count := _count + 1;

      SELECT data->'nodes' INTO _tmp FROM flows WHERE id = _id::uuid LIMIT 1;
      -- Add nodes to our accumulator (NB: This operation is idempotent)
      _nodes := _nodes || _tmp;

      -- Import all edges from portal_node.flowId, replacing the origin (i.e. src=null) with portal_node.id
      -- i.e. edges.map(([src, tgt]) => src === null ? [portal_node.id, tgt] : [src, tgt])
      WITH A AS (
        SELECT jsonb_array_elements(data->'edges') as edges FROM flows WHERE id = _id::uuid
      ),
      B AS (
        SELECT CASE
          WHEN edges->>0 IS NULL THEN
            jsonb_build_array(_key, edges->>1)
          ELSE edges END
        FROM A
      )
      SELECT JSONB_AGG(B.edges) FROM B INTO _tmp;

      -- Add new (processed) edges to our accumulator
      IF _tmp IS NOT NULL THEN
        _edges := _edges || _tmp;
      END IF;

    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('nodes',_nodes,'edges',_edges);
END $$;

-- You can test it by comparing:
-- > SELECT data FROM flows WHERE slug = 'flow_1';
-- vs
-- > SELECT compile_flow_portals((SELECT flows FROM flows WHERE slug = 'flow_1' limit 1));
