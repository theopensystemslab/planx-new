INSERT INTO "public"."stripe_payment_status_enum" ("value", "comment") VALUES
  ('initiated', 'checkout session created, applicant redirected to Stripe')
ON CONFLICT ("value") DO NOTHING;
