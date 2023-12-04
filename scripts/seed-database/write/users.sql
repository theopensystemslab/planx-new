-- insert users overwriting conflicts
CREATE TEMPORARY TABLE sync_users (
  id integer,
  first_name text,
  last_name text,
  email text,
  created_at timestamptz,
  updated_at timestamptz,
  is_platform_admin boolean
  -- ,
  -- is_staging_only boolean
);

\copy sync_users FROM '/tmp/users.csv'  WITH (FORMAT csv, DELIMITER ';');

-- Do not automatically generate team_member records for the templates team
-- We manually truncate and replace the team_members table in another step
ALTER TABLE
  users DISABLE TRIGGER grant_new_user_template_team_access;

INSERT INTO users (
  id,
  first_name,
  last_name,
  email,
  is_platform_admin
  -- ,
  -- is_staging_only
)
SELECT
  id,
  first_name,
  last_name,
  email,
  is_platform_admin
  -- ,
  -- is_staging_only
FROM sync_users
ON CONFLICT (id) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  is_platform_admin = EXCLUDED.is_platform_admin;
  -- is_staging_only = EXCLUDED.is_staging_only;

ALTER TABLE
  users ENABLE TRIGGER grant_new_user_template_team_access;

SELECT setval('users_id_seq', max(id)) FROM users;
