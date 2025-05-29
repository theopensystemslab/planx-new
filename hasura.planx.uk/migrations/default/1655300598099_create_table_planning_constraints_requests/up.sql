CREATE TABLE "public"."planning_constraints_requests" (
    "id" serial NOT NULL,
    "destination_url" text,
    "response" jsonb,
    "session_id" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
COMMENT ON TABLE "public"."planning_constraints_requests" IS E'Audit log of raw planning constraints responses from Digital Land API';
