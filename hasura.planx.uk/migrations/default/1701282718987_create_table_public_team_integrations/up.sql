CREATE TABLE "public"."team_integrations" (
  "id" serial NOT NULL,
  "team_id" integer NOT NULL,
  "staging_bops_submission_url" text,
  "production_bops_submission_url" text,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE restrict ON DELETE cascade,
  UNIQUE ("team_id")
);

COMMENT ON TABLE "public"."team_integrations" IS E'Tracks URLs and API keys for integrations';