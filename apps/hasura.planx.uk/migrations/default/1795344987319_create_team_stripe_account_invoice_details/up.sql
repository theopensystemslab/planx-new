-- A named Stripe account (one not named after its team) has its own invoice details
-- Create an empty row when account is created, following same approach as single account invoice details
CREATE OR REPLACE FUNCTION "public"."create_team_stripe_account_invoice_details"()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."name" IS DISTINCT FROM (SELECT "name" FROM "public"."teams" WHERE "id" = NEW."team_id") THEN
    INSERT INTO "public"."team_invoice_details" ("team_stripe_account_id")
    VALUES (NEW."id")
    ON CONFLICT ("team_stripe_account_id") DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "create_public_team_stripe_accounts_invoice_details"
AFTER INSERT ON "public"."team_stripe_accounts"
FOR EACH ROW
EXECUTE PROCEDURE "public"."create_team_stripe_account_invoice_details" ();
COMMENT ON TRIGGER "create_public_team_stripe_accounts_invoice_details" ON "public"."team_stripe_accounts" IS 'trigger to create invoice details for a named Stripe account';

-- Any named accounts which already exist
INSERT INTO "public"."team_invoice_details" ("team_stripe_account_id")
SELECT tsa."id"
FROM "public"."team_stripe_accounts" tsa
  JOIN "public"."teams" t ON t."id" = tsa."team_id"
WHERE tsa."name" <> t."name"
ON CONFLICT ("team_stripe_account_id") DO NOTHING;
