CREATE PROCEDURE _test_audit()
LANGUAGE plpgsql AS $$
DECLARE
  event events%ROWTYPE;
BEGIN

  ASSERT (SELECT COUNT(*) FROM events) = 0, 'database not empty! skipping tests';
  ASSERT (SELECT COUNT(*) FROM users) = 0, 'database not empty! skipping tests';

  CREATE TABLE _tmp_table_for_tests (
    id integer PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz
  );

  CREATE TRIGGER set__tmp_table_for_tests_updated_at
  BEFORE UPDATE ON _tmp_table_for_tests
  FOR EACH ROW EXECUTE PROCEDURE set_current_timestamp_updated_at();

  PERFORM track_events('_tmp_table_for_tests');

  -- Inserting a row generates an event
  INSERT INTO _tmp_table_for_tests VALUES (1, 'john', NOW());
  ASSERT (SELECT COUNT(*) FROM _tmp_table_for_tests) = 1;
  ASSERT (SELECT COUNT(*) FROM events) = 1;
  SELECT * FROM events ORDER BY id DESC LIMIT 1 INTO event;
  RAISE INFO 'Insert event = %', event;
  ASSERT event.table_name = '_tmp_table_for_tests';
  ASSERT event.action = 'I';
  ASSERT event.row_data @> ('{"id":1, "name": "john", "updated_at": null}')::jsonb;
  ASSERT event.changed_fields::text IS NULL;

  -- Updating a row generates an event
  UPDATE _tmp_table_for_tests SET name = 'rees';
  ASSERT (SELECT COUNT(*) FROM _tmp_table_for_tests) = 1;
  ASSERT (SELECT COUNT(*) FROM events) = 2;
  SELECT * FROM events ORDER BY id DESC LIMIT 1 INTO event;
  RAISE INFO 'Update event = %', event;
  ASSERT event.table_name = '_tmp_table_for_tests';
  ASSERT event.action = 'U';
  ASSERT event.row_data @> ('{"id":1, "name": "john"}')::jsonb;
  ASSERT event.changed_fields @> ('{"name": "rees"}')::jsonb;

  -- Deleting a row generates an event
  DELETE FROM _tmp_table_for_tests;
  ASSERT (SELECT COUNT(*) FROM _tmp_table_for_tests) = 0;
  ASSERT (SELECT COUNT(*) FROM events) = 3;
  SELECT * FROM events ORDER BY id DESC LIMIT 1 INTO event;
  RAISE INFO 'Delete event = %', event;
  ASSERT event.table_name = '_tmp_table_for_tests';
  ASSERT event.action = 'D';
  ASSERT event.row_data @> ('{"id":1, "name": "rees"}')::jsonb;
  ASSERT event.changed_fields IS NULL;

ROLLBACK; END $$;

CALL _test_audit();

DROP PROCEDURE _test_audit;
