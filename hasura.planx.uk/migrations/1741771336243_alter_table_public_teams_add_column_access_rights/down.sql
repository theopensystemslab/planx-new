DROP TRIGGER enforce_flow_status_based_on_team_access ON public.flows;
DROP FUNCTION check_flow_status_based_on_team_access();
DROP TABLE "public"."team_access_rights_enum";
alter table "public"."teams" drop constraint "teams_access_rights_fkey";
alter table "public"."teams" drop column "access_rights"
