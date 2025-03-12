/* 
    Add access_rights column to teams table
*/
alter table "public"."teams" add column "access_rights" text
 not null default 'full';

comment on column "public"."teams"."access_rights" is E'This controls what access to PlanX features a certain team has';

/* 
    Create enum table for access rights 
*/
CREATE TABLE "public"."team_access_rights_enum" ("value" text NOT NULL, "comment" text, PRIMARY KEY ("value") , UNIQUE ("value"));
COMMENT ON TABLE "public"."team_access_rights_enum" IS E'Different types of access we allow to teams';

/* 
    Add two access level to enum table
*/
INSERT INTO "public"."team_access_rights_enum" ("value", "comment") VALUES 
    ('full', 'Team has no restrictions applied'),
    ('trial', 'Team cannot set flow status');

/* 
    Add enum constraint to teams.access_rights column 
*/
alter table "public"."teams"
  add constraint "teams_access_rights_fkey"
  foreign key ("access_rights")
  references "public"."team_access_rights_enum"
  ("value") on update restrict on delete restrict;