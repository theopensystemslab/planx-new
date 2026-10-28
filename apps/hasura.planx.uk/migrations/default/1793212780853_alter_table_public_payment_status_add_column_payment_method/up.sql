alter table "public"."payment_status" add column "payment_method" text null;

COMMENT ON COLUMN "public"."payment_status"."payment_method" IS E'Stripe payment method type (e.g. card, pay_by_bank, bacs_debit). For display and reporting only. Null for GOV.UK Pay, and until the PaymentIntent has a confirmed payment method';
