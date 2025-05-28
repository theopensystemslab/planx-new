alter table "public"."team_settings" add column "submission_email" text
 null;
comment on column "public"."team_settings"."submission_email" is E'Referenced by Send component when configured to email planning office';

UPDATE team_settings
SET submission_email = teams.submission_email
FROM teams
WHERE team_settings.team_id = teams.id;
