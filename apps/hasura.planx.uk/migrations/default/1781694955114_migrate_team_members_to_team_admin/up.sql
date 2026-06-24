INSERT INTO team_members (id, user_id, team_id, role)
SELECT
  gen_random_uuid(),
  user_id,
  team_id,
  'teamAdmin'
FROM team_members
WHERE user_id IN (417, 434, 165, 226, 113, 146, 75, 68, 174, 172, 169, 170, 252, 253, 50, 162, 428, 391, 106, 419, 209, 78, 393, 364, 181, 71, 81, 231, 297, 322, 395, 377, 378, 396, 423, 398, 427, 86, 192, 417, 434)
  AND role != 'teamAdmin';
