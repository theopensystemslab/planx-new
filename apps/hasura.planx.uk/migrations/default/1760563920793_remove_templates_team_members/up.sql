DELETE FROM "public"."team_members"
WHERE team_id = 29;

-- function relies on trigger and trigger has associated pg comment, so drop order and 'CASCADE' matters
DROP TRIGGER IF EXISTS "public"."grant_new_user_template_team_access on users" CASCADE;
DROP FUNCTION IF EXISTS "public"."grant_new_user_template_team_access";
