-- insert users skipping conflicts
CREATE TEMPORARY TABLE sync_users (
  id integer,
  first_name text,
  last_name text,
  email text,
  is_admin boolean,
  created_at timestamptz,
  updated_at timestamptz
);

\copy sync_users FROM '/tmp/users.csv'  WITH (FORMAT csv, DELIMITER ';');

INSERT INTO users (
  id,
  first_name,
  last_name,
  email
)
SELECT
  id,
  first_name,
  last_name,
  email
FROM sync_users
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', max(id)) FROM users;
