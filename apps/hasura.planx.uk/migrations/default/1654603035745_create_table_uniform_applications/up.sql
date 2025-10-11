CREATE TABLE "public"."uniform_applications" (
    "id" serial NOT NULL,
    "idox_submission_id" text,
    "idox_submission_reference" text,
    "destination_url" text,
    "create_submission_request_body" jsonb,
    "create_submission_response" jsonb,
    "attach_archive_response" jsonb,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
comment on column "public"."uniform_applications"."idox_submission_reference" is E'Links to RIPA\'s sessionId';