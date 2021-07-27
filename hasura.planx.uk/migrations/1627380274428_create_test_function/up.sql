CREATE FUNCTION hello_world()
RETURNS VOID AS $$
BEGIN

  RAISE NOTICE 'Hello World';

END; $$ LANGUAGE plpgsql;
