--
-- The following function produces rows that contain the following data:
-- {
--  "node": {},                       // the text of the question
--  "options": [{}],                  // the possible answers
--  "selected_ids": [],               // the answer id(s) selected (NB: a checkbox accepts more than one answer)
--  "selected_at": Date,              // timestamp when the question was answered
--  "event_id": UUID,                 // id of the event that recorded the selections
--  "event_type": session_event_type  // what created the event i.e. human 'click' or automated decision
-- }
--
-- Try it out:
-- > SELECT compile_session_replay((SELECT sessions FROM sessions limit 1));
CREATE OR REPLACE FUNCTION compile_session_replay(session_row sessions)
RETURNS jsonb LANGUAGE sql STABLE AS $$
--
-- The output of `distinct_events` is the same as compile_session_events().
-- It was inlined here as to avoid dependencies between postgres functions.
--
-- It filters out duplicate events for the same question,
-- which happens when the user clicks "back" to change an answer.
--
WITH distinct_events AS (
  SELECT
    DISTINCT ON (parent_node_id) null,
    session_events as event
  FROM session_events
  WHERE session_events.session_id = session_row.id
  ORDER BY
    session_events.parent_node_id ASC,
    session_events.created_at DESC
),
-- Note that `flow_data.nodes` has the following structure:
-- {
--   [uuid]: {},
-- }
-- We need to *filter by the keys* (i.e. the uuid) and *return the value* (i.e. the object)
-- but Postgres doesn't provide a jsonpath filter expression that works like that,
-- so instead what we do is:
--   Step 1. Transform each node into a { key, value } object
--   Step 2. Convert the JSONB from (1) into a RecordSet (i.e. tabulated data)
--   Step 3. Ignore `key` and return only `value` with `SELECT value`
--   Step 4. Filter using `WHERE key IN ()`
--
replay_rows AS (
  SELECT
  -- Output: node (i.e. the question, including its id)
  jsonb_set(
    sessions.flow_data->'nodes'->(event).parent_node_id,
    '{id}',
    to_jsonb((event).parent_node_id)
  ) as node
  -- Output: options
  , ARRAY(
    --     vvvvv Step 3
    SELECT jsonb_set(value,'{id}',to_jsonb(key))
    --   vvvvvvvvvvvvvvvvvv Step 2
    FROM jsonb_to_recordset(
      -- vvvvvvvvvvvvvvvvvvv Step 1
      jsonb_path_query_array(sessions.flow_data, '$.nodes[*].keyvalue()'))
    AS (key text, value jsonb)
    --    vvvvvv Step 4
    WHERE key IN (
        SELECT * FROM jsonb_array_elements_text(
          jsonb_path_query_array(
            -- ## data to be filtered ##
            sessions.flow_data,
            -- ## jsonpath query ##
            -- Edges have the following structure: [source_id, target_id]
            -- The jsonpath below finds all edges in which the source_id === parent_node_id
            '$.edges ? (@[0] == $parent_node_id)[1]',
            -- ## variables for the query ##
            -- Creates an object like { parent_node_id: uuid }
            -- which is injected into the jsonpath query above
            jsonb_build_object('parent_node_id', (event).parent_node_id))
        )
      )
  ) as options
  , (event).chosen_node_ids AS selected_ids
  -- Output: event_id
  , (event).id AS event_id
  -- Output: event_type
  , (event).type AS event_type
  -- Output: selected_at
  , (event).created_at AS selected_at
  FROM distinct_events
  JOIN sessions ON sessions.id = session_row.id
  ORDER BY (event).created_at ASC
)
-- Convert RecordSet (tabular data) into JSON Array
SELECT jsonb_agg(replay_rows) FROM replay_rows;
$$;
