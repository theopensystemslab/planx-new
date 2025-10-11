DROP TABLE events CASCADE;
DROP FUNCTION process_event;
DROP FUNCTION track_events;

DO
$do$
DECLARE
   _sql text;
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
    EXECUTE 'DROP TRIGGER IF EXISTS tg_event ON ' || table_name;
  END LOOP;
END
$do$;
