CREATE TABLE "public"."s3_applications" (
    "id" serial NOT NULL, 
    "session_id" text NOT NULL,
    "team_slug" text NOT NULL,
    "webhook_request" JSONB NOT NULL,
    "webhook_response" JSONB NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

COMMENT ON TABLE "public"."s3_applications" IS 'Stores a receipt of applications submitted using the Upload to AWS S3 method with notifications via Power Automate webhook';
