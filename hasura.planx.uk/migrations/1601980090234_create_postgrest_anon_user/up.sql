CREATE USER postgrest_anon;

GRANT CONNECT ON DATABASE db TO postgrest_anon;

GRANT USAGE ON SCHEMA public TO postgrest_anon;

GRANT SELECT ON sessions TO postgrest_anon;
