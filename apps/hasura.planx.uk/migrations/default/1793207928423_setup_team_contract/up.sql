CREATE TABLE "public"."team_contract_enum" (
  "value" text NOT NULL, 
  "comment" text NOT NULL, 
  PRIMARY KEY ("value") , 
  UNIQUE ("value")
);
COMMENT ON TABLE "public"."team_contract_enum" IS E'Team contract types';

INSERT INTO "public"."team_contract_enum"("value", "comment") 
VALUES (E'with_sc', E'Full contract with service charges'),
  (E'opt_out_sc', E'Full contract without service charges'),
  (E'none', E'No contract eg internal team');

ALTER TABLE "public"."team_settings" ADD column "contract" text NOT NULL default 'none';

ALTER TABLE "public"."team_settings"
  ADD constraint "team_settings_contract_fkey"
  foreign key ("contract")
  references "public"."team_contract_enum"
  ("value") on update cascade on delete no action;

-- Update default column values, we'll want to manually adjust opt-out LPAs on prod later then sync to other envs! 
UPDATE team_settings ts
SET contract = 'with_sc'
FROM teams t
WHERE t.id = ts.team_id AND t.category = 'lpa';
