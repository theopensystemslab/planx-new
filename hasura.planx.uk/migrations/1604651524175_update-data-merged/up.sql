-- Denormalizes external portals
-- That is, it merges nodes and edges from a portal's flow into the main flow (recursively)
-- PS: Would've preferred to use recursion but https://stackoverflow.com/questions/23494361/recursive-function-in-postgres#comment50673363_23979656
CREATE OR REPLACE FUNCTION compile_flow_portals(flow_row flows)
RETURNS jsonb
LANGUAGE plpgsql STABLE AS $$
DECLARE
  _nodes jsonb;
  _edges jsonb;
  _portals_processed text[];
  _key text;
  _value jsonb;
  _subkey text;
  _subvalue jsonb;
  _tmp jsonb;
  _subflow_id text;
  _should_loop_again bool;
  _edge text;
  _node_name text;
BEGIN
  -- Initialize aggregator with the root flow
  _nodes := flow_row.data;

  -- Initialise outer loop
  _should_loop_again := TRUE;

  -- Loop until there are no more new portals {{{
    WHILE _should_loop_again LOOP
      _should_loop_again := 0;

      --- Loop over each node in our accumulator {{{
        FOR _key, _value IN SELECT * FROM jsonb_each(_nodes) LOOP
          -- Ignore _root and non-external portals {{{
            IF (_value->'type' IS NULL OR (_value->'type')::int <> 310) THEN
              CONTINUE;
            END IF;
          --- }}}

          --- Get subflow id {{{
            -- Need to TRIM because JSON TEXT is always double-quoted
            -- i.e. (('{"key":"value"}'::jsonb)->'key')::text == '"value"'
            _subflow_id := TRIM('"' FROM (_value->'data'->'flowId')::TEXT);
          --- }}}

          -- Ignore already processed portals {{{
            IF (_subflow_id = ANY(_portals_processed)) THEN
              CONTINUE;
            END IF;
            _portals_processed = _portals_processed || ARRAY[_subflow_id];
          --- }}}

          -- From this point on (because of the CONTINUEs above), this branch means "found new portal,"
          -- in which case we inform the outer loop to do (at least) one more cycle
          -- to check if the present new portal's flow contains further portals
          _should_loop_again := TRUE;

          -- Pull subflow's data
          SELECT data INTO _tmp FROM flows WHERE id = _subflow_id::uuid LIMIT 1;

          -- Loop over each node of the subflow {{{
            FOR _subkey, _subvalue IN SELECT * FROM jsonb_each(_tmp) LOOP
              -- Prepend flow id as a prefix to each edge {{{
                _edges := jsonb_build_array();
                FOR _edge IN SELECT * FROM jsonb_array_elements_text(_subvalue->'edges') LOOP
                    _edges := _edges || jsonb_build_array(_subflow_id || '.' || _edge);
                END LOOP;
              --- }}}

              -- Prepend flow id to each node id (aside from _root) {{{
              IF (_subkey::TEXT = '_root'::TEXT) THEN
                _node_name := _subflow_id;
              ELSE
                _node_name := _subflow_id || '.' || _subkey;
              END IF;
              --- }}}

              -- Merge the modified subflow into our accumulator
              _nodes := _nodes || jsonb_build_object(_node_name, _subvalue || jsonb_build_object('edges', _edges));
            END LOOP;
          --- }}}

        END LOOP;
      --- }}} Loop over each node in the accumulator
    END LOOP;
  --- }}}  Loop until there are no more new portals
  RETURN _nodes;
END $$;

-- You can test it by comparing:
-- > SELECT data FROM flows WHERE slug = 'flow_1';
-- vs
-- > SELECT compile_flow_portals((SELECT flows FROM flows WHERE slug = 'root' limit 1));
