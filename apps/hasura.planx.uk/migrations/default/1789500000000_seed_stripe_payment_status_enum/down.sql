DELETE FROM "public"."stripe_payment_status_enum"
WHERE "value" IN (
  'processing',
  'succeeded',
  'payment_failed'
);
