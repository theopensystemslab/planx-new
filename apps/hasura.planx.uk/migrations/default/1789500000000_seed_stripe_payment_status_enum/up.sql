INSERT INTO "public"."stripe_payment_status_enum" ("value", "comment") VALUES
  ('processing', 'payment submitted, awaiting confirmation (e.g. Bacs, bank transfer)'),
  ('succeeded', 'payment succeeded'),
  ('payment_failed', 'payment attempt failed')
ON CONFLICT ("value") DO NOTHING;
