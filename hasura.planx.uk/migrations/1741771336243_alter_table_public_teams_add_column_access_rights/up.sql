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

/*  
    Create a function to throw error if access_rights === 'trial' 
    and flow.status === 'online' 
*/
CREATE OR REPLACE FUNCTION check_flow_status_based_on_team_access()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM teams
    WHERE teams.id = NEW.team_id
    AND teams.access_rights = 'trial'
    AND NEW.status = 'online'
  ) THEN
    RAISE EXCEPTION 'Trial teams cannot have online flows';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* 
    Add a trigger to run above function when status is updated 
*/
CREATE TRIGGER enforce_flow_status_based_on_team_access
BEFORE UPDATE ON flows
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION check_flow_status_based_on_team_access();