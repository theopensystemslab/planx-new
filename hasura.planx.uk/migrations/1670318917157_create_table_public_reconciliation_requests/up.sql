CREATE TABLE "public"."reconciliation_requests" (
  "id" serial NOT NULL, 
  "session_id" text, 
  "response" jsonb, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  PRIMARY KEY ("id") , UNIQUE ("id")
);
COMMENT ON TABLE "public"."reconciliation_requests" IS E'Audit log of reconcilied session data for successfully resumed lowcal_sessions';
