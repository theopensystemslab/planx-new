-- Copying a flow (its `flows` row, associated `operations` row, and `flow_notes`) previously happened as
-- several independent Hasura mutations from the API, so a failure partway through (eg. after the flow was inserted but before its notes were copied) left a visibly half-copied flow.
-- Using a plpgsql function means we can run it in a single Postgres transaction and guard against this

-- schema-qualified because an earlier migration (`PostGIS_Extensions_Upgrade()`) mutates the session's
-- search_path for the rest of a from-scratch migration run (e.g. in CI/e2e, where every migration replays
-- in one continuous session) - an unqualified CREATE FUNCTION would silently land in the `tiger` schema
CREATE FUNCTION public.rename_node_id(node_id text, replace_value text)
RETURNS text AS $$
BEGIN
  -- mirrors renameNodeId() in apps/api.planx.uk/helpers.ts: leave _root and null ids untouched,
  -- otherwise replace the last `length(replace_value)` characters
  IF node_id IS NULL OR node_id = '_root' THEN
    RETURN node_id;
  END IF;
  RETURN left(node_id, length(node_id) - length(replace_value)) || replace_value;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION public.remap_note_placement(placement jsonb, replace_value text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- "parent" is always present, "container"/"before" are only renamed if the key exists
  IF placement IS NULL THEN
    RETURN NULL;
  END IF;

  result := jsonb_set(placement, '{parent}', to_jsonb(public.rename_node_id(placement->>'parent', replace_value)));

  IF placement ? 'container' THEN
    result := jsonb_set(result, '{container}', to_jsonb(public.rename_node_id(placement->>'container', replace_value)));
  END IF;

  IF placement ? 'before' THEN
    result := jsonb_set(result, '{before}', to_jsonb(public.rename_node_id(placement->>'before', replace_value)));
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION public.copy_flow(
  source_flow_id uuid,
  team_id integer,
  slug text,
  name text,
  flow_data jsonb,
  is_service boolean,
  is_pattern boolean,
  replace_value text,
  creator_id integer
) RETURNS flows AS $$
DECLARE
  new_flow flows;
  note_map jsonb := '{}'::jsonb;
  note_row record;
  new_note_id uuid;
BEGIN
  IF creator_id IS NULL THEN
    RAISE EXCEPTION 'copy_flow requires a creator_id - flows cannot be copied without an authenticated user';
  END IF;

  INSERT INTO flows (team_id, slug, name, data, version, copied_from, is_template, is_service, is_pattern, creator_id)
  VALUES (team_id, slug, name, flow_data, 1, source_flow_id, false, is_service, is_pattern, creator_id)
  RETURNING * INTO new_flow;

  -- needed for ShareDB
  INSERT INTO operations (flow_id, version, data)
  VALUES (new_flow.id, 1, '{}'::jsonb);

  -- one new flow_note_content row per unique note referenced by the source flow
  FOR note_row IN
    SELECT DISTINCT c.id, c.text, c.color
    FROM flow_note_content c
    JOIN flow_note_positions p ON p.note_id = c.id
    WHERE p.flow_id = source_flow_id
  LOOP
    INSERT INTO flow_note_content (text, color, created_by, updated_by)
    VALUES (note_row.text, note_row.color, creator_id, creator_id)
    RETURNING id INTO new_note_id;

    note_map := note_map || jsonb_build_object(note_row.id::text, new_note_id::text);
  END LOOP;

  -- every position (original + clone) now points at the copied note
  INSERT INTO flow_note_positions (note_id, flow_id, node_id, placement, created_by)
  SELECT
    (note_map ->> p.note_id::text)::uuid,
    new_flow.id,
    public.rename_node_id(p.node_id, replace_value),
    public.remap_note_placement(p.placement, replace_value),
    creator_id
  FROM flow_note_positions p
  WHERE p.flow_id = source_flow_id;

  RETURN new_flow;
END;
$$ LANGUAGE plpgsql VOLATILE;
