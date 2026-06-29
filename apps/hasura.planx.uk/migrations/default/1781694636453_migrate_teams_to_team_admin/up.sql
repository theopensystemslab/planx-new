INSERT INTO team_members (id, user_id, team_id, role)
SELECT
  gen_random_uuid(),
  user_id,
  team_id,
  'teamAdmin'
FROM team_members
WHERE team_id IN (22, 27, 65, 36, 3, 50, 31, 37, 6, 28, 25)
  AND role != 'teamAdmin';
