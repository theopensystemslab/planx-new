CREATE TABLE "public"."temp_data_migrations_audit" (
  "flow_id" uuid NOT NULL, 
  "team_id" integer NOT NULL, 
  "updated" boolean NOT NULL DEFAULT false, 
  "updated_at" timestamptz NOT NULL DEFAULT now(), 
  PRIMARY KEY ("flow_id") 
);
COMMENT ON TABLE "public"."temp_data_migrations_audit" IS E'Basic table structure that we can use to track status of data migrations. Contents of this table are ephemeral and may be truncated between migrations';
