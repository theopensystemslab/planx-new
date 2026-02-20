-- insert users overwriting conflicts
CREATE TEMPORARY TABLE sync_users (
  id integer,
  first_name text,
  last_name text,
  email text,
  created_at timestamptz,
  updated_at timestamptz,
  is_platform_admin boolean,
  is_staging_only boolean,
  is_analyst boolean,
  default_team_id integer
);

\copy sync_users FROM '/tmp/users.csv'  WITH (FORMAT csv, DELIMITER ';');

INSERT INTO users (
  id,
  first_name,
  last_name,
  email,
  is_platform_admin,
  is_staging_only,
  is_analyst,
  default_team_id
)
SELECT
  id,
  first_name,
  last_name,
  email,
  is_platform_admin,
  is_staging_only,
  is_analyst,
  default_team_id
FROM sync_users
ON CONFLICT (id) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  is_platform_admin = EXCLUDED.is_platform_admin,
  is_staging_only = EXCLUDED.is_staging_only,
  is_analyst = EXCLUDED.is_analyst,
  default_team_id = EXCLUDED.default_team_id;

SELECT setval('users_id_seq', max(id)) FROM users;
