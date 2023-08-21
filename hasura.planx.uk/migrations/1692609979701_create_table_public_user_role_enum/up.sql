CREATE TABLE "public"."user_role_enum" (
  "value" text NOT NULL,
  PRIMARY KEY ("value"),
  UNIQUE ("value")
);

COMMENT ON TABLE "public"."user_role_enum" IS E'Enum of possible user roles in PlanX';

INSERT INTO
  "public"."user_role_enum"("value")
VALUES
  (E'platformManager');

CREATE TABLE "public"."user_roles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" integer NOT NULL,
  "value" text NOT NULL,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE cascade ON DELETE cascade,
  FOREIGN KEY ("value") REFERENCES "public"."user_role_enum"("value") ON UPDATE cascade ON DELETE cascade,
  UNIQUE ("user_id")
);

COMMENT ON TABLE "public"."user_roles" IS E'Maps the relationships between users and their roles';

CREATE EXTENSION IF NOT EXISTS pgcrypto;