-- The Hasura checks prevent us from constructing invalid data that might break the SQL query,
-- so the Hasura level tests do not fully test the mid-transaction rollback behaviour
-- This test tries to insert invalid flow_note_positions which should cause a transaction rollback

CREATE PROCEDURE _test_copy_flow()
LANGUAGE plpgsql AS $$
DECLARE
  test_user_id integer;
  source_flow_id uuid;
  content_id uuid;
  copied flows;
  raised_expected_error boolean := false;
BEGIN
  ASSERT (SELECT COUNT(*) FROM flows) = 0, 'database not empty! skipping tests';
  ASSERT (SELECT COUNT(*) FROM users) = 0, 'database not empty! skipping tests';

  INSERT INTO users (first_name, last_name, email)
  VALUES ('Test', 'CopyFlow', 'copy-flow-sql-test@example.com')
  RETURNING id INTO test_user_id;

  INSERT INTO flows (slug, name, data)
  VALUES ('TEST_copy_flow_sql_source', 'Test copy_flow SQL source', '{"_root": {"edges": ["a"]}}'::jsonb)
  RETURNING id INTO source_flow_id;

  INSERT INTO flow_note_content (text, color, created_by, updated_by)
  VALUES ('A note', '#fffdb0', test_user_id, test_user_id)
  RETURNING id INTO content_id;

  INSERT INTO flow_note_positions (note_id, flow_id, node_id, created_by)
  VALUES (content_id, source_flow_id, 'a', test_user_id);

  -- sanity check: a normal call succeeds and copies the flow, its operation, and its note
  copied := copy_flow(
    source_flow_id, NULL, 'TEST_copy_flow_sql_dest', 'Test copy_flow SQL dest',
    '{"_root": {"edges": ["aXXXXX"]}}'::jsonb, false, false, 'XXXXX', test_user_id
  );
  ASSERT copied.id IS NOT NULL;
  ASSERT (SELECT COUNT(*) FROM operations WHERE flow_id = copied.id) = 1;
  ASSERT (SELECT COUNT(*) FROM flow_note_positions WHERE flow_id = copied.id) = 1;

  -- make a dangling note position on the source flow: a note_id that doesn't reference any flow_note_content row,
  -- violating the NOT NULL constraint, thus should fail and cause the whole transaction to rollback
  SET session_replication_role = replica;
  INSERT INTO flow_note_positions (note_id, flow_id, node_id, created_by)
  VALUES (gen_random_uuid(), source_flow_id, 'dangling', test_user_id);
  SET session_replication_role = origin;

  BEGIN
    PERFORM copy_flow(
      source_flow_id, NULL, 'TEST_copy_flow_sql_should_not_exist', 'Should not exist',
      '{"_root": {"edges": []}}'::jsonb, false, false, 'XXXXX', test_user_id
    );
  EXCEPTION WHEN OTHERS THEN
    raised_expected_error := true;
    RAISE INFO 'copy_flow correctly raised: %', SQLERRM;
  END;

  ASSERT raised_expected_error,
    'copy_flow should have raised an error when a note position could not be remapped';

  ASSERT (SELECT COUNT(*) FROM flows WHERE slug = 'TEST_copy_flow_sql_should_not_exist') = 0,
    'a flows row was left behind despite the notes copy failing - copy_flow is not atomic';

ROLLBACK; END $$;

CALL _test_copy_flow();

DROP PROCEDURE _test_copy_flow();
