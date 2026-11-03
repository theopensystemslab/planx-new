ALTER TABLE team_settings
  ADD CONSTRAINT stripe_revert_requires_production_stripe
  CHECK (production_payment_provider IS DISTINCT FROM 'stripe' OR payment_provider = 'stripe');
