-- Each content and positions should use a 'soft' delete pattern
ALTER TABLE "public"."flow_note_content" 
ADD COLUMN "deleted_at" timestamptz NULL;

ALTER TABLE "public"."flow_note_positions" 
ADD COLUMN "deleted_at" timestamptz NULL;

-- Positions should consistently capture `updated_by`
ALTER TABLE "public"."flow_note_positions" 
ADD COLUMN "updated_by" integer NULL;

-- Initially populate based on `created_by` so that we can enforce a not null constraint
UPDATE flow_note_positions 
SET updated_by = created_by;

ALTER TABLE flow_note_positions 
ALTER COLUMN updated_by SET NOT NULL;

-- 'Replace' `copy_flow` function which populates `flow_note_positions` and should now also account for `updated_by`
CREATE OR REPLACE FUNCTION public.copy_flow(source_flow_id uuid, team_id integer, slug text, name text, flow_data jsonb, is_service boolean, is_pattern boolean, replace_value text, creator_id integer)
 RETURNS flows
 LANGUAGE plpgsql
AS $function$
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
    SELECT DISTINCT c.id, c.text
    FROM flow_note_content c
    JOIN flow_note_positions p ON p.note_id = c.id
    WHERE p.flow_id = source_flow_id
  LOOP
    INSERT INTO flow_note_content (text, created_by, updated_by)
    VALUES (note_row.text, creator_id, creator_id)
    RETURNING id INTO new_note_id;

    note_map := note_map || jsonb_build_object(note_row.id::text, new_note_id::text);
  END LOOP;

  -- every position (original + clone) now points at the copied note
  INSERT INTO flow_note_positions (note_id, flow_id, node_id, placement, created_by, updated_by)
  SELECT
    (note_map ->> p.note_id::text)::uuid,
    new_flow.id,
    public.rename_node_id(p.node_id, replace_value),
    public.remap_note_placement(p.placement, replace_value),
    creator_id,
    creator_id
  FROM flow_note_positions p
  WHERE p.flow_id = source_flow_id;

  RETURN new_flow;
END;
$function$;
