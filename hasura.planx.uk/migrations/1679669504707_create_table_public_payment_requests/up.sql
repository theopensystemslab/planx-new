CREATE TABLE "public"."payment_requests" (
  "payment_request_id" uuid NOT NULL DEFAULT gen_random_uuid(), 
  "session_id" uuid NOT NULL, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "payee_email" text NOT NULL, 
  "session_preview_data" jsonb NOT NULL, 
  "paid_at" timestamptz,
  PRIMARY KEY ("payment_request_id") , 
  FOREIGN KEY ("session_id") REFERENCES "public"."lowcal_sessions"("id") 
    ON UPDATE restrict ON DELETE cascade, 
  UNIQUE ("payment_request_id")
);
COMMENT ON TABLE "public"."payment_requests" IS E'Tracks requests for a third-party to pay for applications';