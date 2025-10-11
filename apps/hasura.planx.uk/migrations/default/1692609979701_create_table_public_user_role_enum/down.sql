alter table
  "public"."team_members" drop constraint "team_members_role_fkey";

alter table
  "public"."team_members" drop column "role";

DROP TABLE "public"."user_roles";