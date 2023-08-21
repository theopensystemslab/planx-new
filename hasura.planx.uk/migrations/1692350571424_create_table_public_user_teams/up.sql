CREATE TABLE "public"."team_members" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" integer NOT NULL,
  "team_id" integer NOT NULL,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE cascade ON DELETE cascade,
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE cascade ON DELETE cascade
);

COMMENT ON TABLE "public"."team_members" IS E'Tracks relationship between users and teams';

CREATE EXTENSION IF NOT EXISTS pgcrypto;