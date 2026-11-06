ALTER TABLE "public"."payment_status" ADD COLUMN "stripe_event_id" TEXT NULL;

ALTER TABLE "public"."payment_status" ADD CONSTRAINT "payment_status_stripe_event_id_key" UNIQUE ("stripe_event_id");

COMMENT ON COLUMN "public"."payment_status"."stripe_event_id" IS E'ID of the Stripe webhook event which created this row. Unique, so a redelivered event is not recorded twice. Null for GOV.UK Pay, for "initiated" rows (not created from an event), and for rows recorded before this column existed';
