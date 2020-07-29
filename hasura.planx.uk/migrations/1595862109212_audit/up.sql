-- Audit (Activity log) table and triggers
-- Based on https://github.com/hasura/audit-trigger

CREATE TABLE events (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  author_id integer REFERENCES users ON DELETE CASCADE,
  action char(1) NOT NULL CHECK (action IN ('I','D','U', 'T')),
  row_data jsonb,
  changed_fields jsonb,
  created_at timestamptz DEFAULT NOW() NOT NULL
);
COMMENT ON COLUMN events.row_data IS 'Record value. For INSERT this is the new record. For DELETE and UPDATE it is the old record.';
COMMENT ON COLUMN events.changed_fields IS 'New values of fields changed by UPDATE. Null except for row-level UPDATE events.';

CREATE OR REPLACE FUNCTION process_event()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  _sql text;
  event_row events%ROWTYPE;
  _user_id users.id%TYPE;
  excluded_cols text[] = ARRAY[]::text[];
  new_r jsonb;
  old_r jsonb;
BEGIN
  _user_id := current_setting('hasura.user', 't')::jsonb->>'x-hasura-user-id';
  event_row = ROW(
    nextval('events_id_seq'),  -- id
    TG_TABLE_NAME::text,       -- table_name
    _user_id,                  -- author_id
    substring(TG_OP,1,1),      -- action
    NULL,                      -- row_data
    NULL,                      -- changed_fields
    NOW()                      -- created_at
  );

  IF (TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW') THEN
    old_r = to_jsonb(OLD);
    new_r = to_jsonb(NEW);
    event_row.row_data = old_r - excluded_cols;
    SELECT
      jsonb_object_agg(new_t.key, new_t.value) - excluded_cols
    INTO
      event_row.changed_fields
    FROM jsonb_each(old_r) as old_t
    JOIN jsonb_each(new_r) as new_t
    ON (old_t.key = new_t.key AND old_t.value <> new_t.value);
  ELSIF (TG_OP = 'DELETE' AND TG_LEVEL = 'ROW') THEN
    event_row.row_data = to_jsonb(OLD) - excluded_cols;
  ELSIF (TG_OP = 'INSERT' AND TG_LEVEL = 'ROW') THEN
    event_row.row_data = to_jsonb(NEW) - excluded_cols;
  ELSIF (TG_LEVEL = 'STATEMENT' AND TG_OP IN ('INSERT','UPDATE','DELETE','TRUNCATE')) THEN
    RAISE EXCEPTION '[process_event] - Trigger func added as trigger for unhandled case: %, %',TG_OP, TG_LEVEL;
    RETURN NULL;
  END IF;

  INSERT INTO events VALUES (event_row.*);

  RETURN NULL;
END
$$;

CREATE OR REPLACE FUNCTION track_events(target_table regclass) RETURNS void AS $body$
DECLARE
_sql text;
BEGIN
  EXECUTE 'DROP TRIGGER IF EXISTS tg_event ON ' || target_table;

  EXECUTE '
  CREATE TRIGGER tg_event
  AFTER INSERT OR UPDATE OR DELETE
  ON ' || target_table || '
  FOR EACH ROW EXECUTE PROCEDURE process_event();
    ';
END;
$body$
language 'plpgsql';

DO
  $do$
  DECLARE
  table_name text;
  table_names varchar[] := array[
  'flows',
  'team_members',
  'teams',
  'users'
  ];
  BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
      EXECUTE 'SELECT track_events(' || quote_literal(table_name) || ')';
END LOOP;
END
$do$;
