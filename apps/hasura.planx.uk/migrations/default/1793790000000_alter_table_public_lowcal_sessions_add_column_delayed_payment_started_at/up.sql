ALTER TABLE "public"."lowcal_sessions" ADD COLUMN "delayed_payment_started_at" TIMESTAMPTZ NULL;

COMMENT ON COLUMN "public"."lowcal_sessions"."delayed_payment_started_at" IS E'When the applicant first started a delayed payment (e.g. Bacs Direct Debit) for this session. Set once, never cleared - the session can be resumed to pay again for 28 days from this date';
