CREATE FUNCTION compile_session_events(
  session_row sessions
)
RETURNS SETOF session_events
LANGUAGE sql STABLE AS $$
  -- We can't `SELECT *` because
  -- `DISTINCT ON` prepends a column to the query result
  -- which creates a mismatch 
  -- with the defined return type (i.e. `SETOF session_events`)
  -- So we're using [Nested Records][1] instead.
  --     v              v
  SELECT (session_events).* FROM (
    SELECT
      DISTINCT ON (parent_node_id) null,
      -- vvvvvvvvvvv
      session_events
    FROM session_events
    WHERE session_events.session_id = session_row.id
    ORDER BY
      session_events.parent_node_id ASC,
      session_events.created_at DESC
    ) distinct_events
    --       v              v
    ORDER BY (session_events).created_at ASC;
$$;
-- [1]: https://blog.jooq.org/2018/05/14/selecting-all-columns-except-one-in-postgresql/

COMMENT ON FUNCTION compile_session_events IS 'Filters out events with duplicated parent_node_id (e.g. clicking "back" and changing the answer)';
