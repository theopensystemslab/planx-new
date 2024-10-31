CREATE TABLE "public"."goss_applications" (
  "id" serial NOT NULL,
  "session_id" uuid NOT NULL,
  "goss_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "sanitised_at" timestamptz,
  "payload" jsonb NOT NULL,
  "destination_url" text NOT NULL,
  "response" jsonb null,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("session_id") REFERENCES "public"."lowcal_sessions"("id") ON UPDATE restrict ON DELETE cascade
);

COMMENT ON TABLE "public"."goss_applications" IS E'Applications submitted to the GOSS case management system';