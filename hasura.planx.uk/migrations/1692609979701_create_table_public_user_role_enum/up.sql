CREATE TABLE "public"."user_roles" (
  "value" text NOT NULL,
  PRIMARY KEY ("value"),
  UNIQUE ("value")
);

COMMENT ON TABLE "public"."user_roles" IS E'Enum of possible user roles in PlanX';

INSERT INTO
  "public"."user_roles"("value")
VALUES
  (E'admin'),
  (E'viewer');

alter table
  "public"."team_members"
add
  column "role" text not null default 'viewer';

alter table
  "public"."team_members"
add
  constraint "team_members_role_fkey" foreign key ("role") references "public"."user_roles" ("value") on update cascade on delete cascade;