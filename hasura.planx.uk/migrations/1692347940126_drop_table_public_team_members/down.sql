CREATE TABLE "public"."team_members"(
  "team_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "creator_id" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("team_id", "user_id")
);

CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"() 
RETURNS TRIGGER AS $$ 
DECLARE 
  _new record;
BEGIN 
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_public_team_members_updated_at" BEFORE
UPDATE
  ON "public"."team_members" FOR EACH ROW EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();

COMMENT ON TRIGGER "set_public_team_members_updated_at" ON "public"."team_members" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

alter table
  "public"."team_members"
add
  constraint "team_members_user_id_fkey" foreign key ("user_id") references "public"."users" ("id") on update restrict on delete restrict;

alter table
  "public"."team_members"
add
  constraint "team_members_creator_id_fkey" foreign key ("creator_id") references "public"."users" ("id") on update restrict on delete restrict;

alter table
  "public"."team_members"
add
  constraint "team_members_team_id_fkey" foreign key ("team_id") references "public"."teams" ("id") on update restrict on delete restrict;

comment on table "public"."team_members" is E'Assigns `users` to `teams`, currently no differences in access or permission levels though';