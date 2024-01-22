CREATE TABLE "public"."feedback" (
  "id" serial not null unique,
  PRIMARY KEY ("id"),
  "team_id" integer,
  "flow_id" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "node_id" text,
  "node_text" text,
  "help_text" text,
  "project_type" text,
  "address" text,
  "device" jsonb NOT NULL,
  "breadcrumbs" jsonb NOT NULL,
  "component_metadata" jsonb NOT NULL,
  "user_context" text,
  "user_comment" text NOT NULL,
  "feedback_type" text NOT NULL,
  "status" text,
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE restrict ON DELETE restrict,
  FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON UPDATE restrict ON DELETE restrict,
  UNIQUE ("id")
);

COMMENT ON TABLE "public"."feedback" IS E'A table for storing user feedback on services';
COMMENT ON COLUMN "public"."feedback"."user_context" is E'User explanation of the context in which they\'re sharing comment';
COMMENT ON COLUMN "public"."feedback"."user_comment" is E'The user\'s comment on the service';
COMMENT ON COLUMN "public"."feedback"."status" is E'The status of our processing of the feedback';

ALTER TABLE
  feedback
ADD
  CONSTRAINT feedback_feedback_type_fkey FOREIGN KEY (feedback_type) REFERENCES feedback_type_enum;

ALTER TABLE
  feedback
ADD
  CONSTRAINT feedback_status_fkey FOREIGN KEY (status) REFERENCES feedback_status_enum;

