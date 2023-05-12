CREATE TABLE "public"."email_applications" (
  "id" serial NOT NULL, 
  "session_id" text NOT NULL, 
  "team_slug" text NOT NULL, 
  "recipient" text NOT NULL, 
  "request" jsonb NOT NULL,
  "response" jsonb NOT NULL, 
  "created_at" Timestamp NOT NULL DEFAULT now(), 
  "sanitised_at" timestamptz, 
  PRIMARY KEY ("id") , 
  UNIQUE ("id")
);

COMMENT ON TABLE "public"."email_applications" IS E'Stores a receipt of applications submitted via email using GOVUK Notify';
