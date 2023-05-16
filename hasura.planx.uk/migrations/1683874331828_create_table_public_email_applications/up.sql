CREATE TABLE "public"."email_applications" (
  "id" serial NOT NULL, 
  "session_id" uuid NOT NULL, 
  "team_slug" text NOT NULL, 
  "recipient" text NOT NULL, 
  "request" jsonb NOT NULL,
  "response" jsonb NOT NULL, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "sanitised_at" timestamptz, 
  PRIMARY KEY ("id"), 
  FOREIGN KEY ("session_id") REFERENCES "public"."lowcal_sessions"("id") ON UPDATE restrict ON DELETE cascade,
  UNIQUE ("id")
);

COMMENT ON TABLE "public"."email_applications" IS E'Stores a receipt of applications submitted via email using GOVUK Notify';
