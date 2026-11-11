ALTER TABLE "public"."lowcal_sessions" ADD COLUMN "paid_at" TIMESTAMPTZ NULL;

COMMENT ON COLUMN "public"."lowcal_sessions"."paid_at" IS E'When a delayed payment (e.g. Bacs Direct Debit) for this session succeeded. Setting it submits the application (setup_session_payment_send_events trigger). Null for other payments, which the applicant submits from their browser, and for invite to pay (see payment_requests.paid_at)';
