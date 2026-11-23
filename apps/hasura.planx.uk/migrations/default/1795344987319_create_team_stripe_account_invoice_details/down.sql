-- Invoice details already created for named accounts are kept
DROP TRIGGER "create_public_team_stripe_accounts_invoice_details" ON "public"."team_stripe_accounts";

DROP FUNCTION "public"."create_team_stripe_account_invoice_details"();
