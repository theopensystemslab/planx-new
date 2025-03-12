alter table "public"."teams" drop constraint "teams_access_rights_fkey";

alter table "public"."teams" drop column "access_rights"

DROP TABLE "public"."team_access_rights_enum";
