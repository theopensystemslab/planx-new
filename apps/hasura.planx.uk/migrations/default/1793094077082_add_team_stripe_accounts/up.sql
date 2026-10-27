-- Support multiple stripe accounts per team
CREATE TABLE "public"."team_stripe_accounts" (
  "id" serial NOT NULL,
  "team_id" integer NOT NULL,
  "name" text NULL,
  "production_stripe_account_id" text NULL,
  "staging_stripe_account_id" text NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE,

  -- NULLS NOT DISTINCT allows only one main (unnamed) account per team
  CONSTRAINT "team_stripe_accounts_team_id_name_key" UNIQUE NULLS NOT DISTINCT ("team_id", "name")
);

COMMENT ON TABLE "public"."team_stripe_accounts" IS E'Stripe Connect accounts linked to a team. A team has one main account (name is null), and can have additional named accounts';
COMMENT ON COLUMN "public"."team_stripe_accounts"."name" IS E'use NULL name as the default - stripe accounts only need to be named to disambiguate when a team has multiple';
COMMENT ON COLUMN "public"."team_stripe_accounts"."production_stripe_account_id" IS E'Stripe Connect account id (acct_...) linked via OAuth for production payments';
COMMENT ON COLUMN "public"."team_stripe_accounts"."staging_stripe_account_id" IS E'Stripe Connect account id (acct_...) linked via onboarding for staging payments';

CREATE TRIGGER "set_public_team_stripe_accounts_updated_at"
BEFORE UPDATE ON "public"."team_stripe_accounts"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at" ();
COMMENT ON TRIGGER "set_public_team_stripe_accounts_updated_at" ON "public"."team_stripe_accounts" IS 'trigger to set value of column "updated_at" to current timestamp on row update';

-- Move existing connected accounts across as each team's main account
INSERT INTO "public"."team_stripe_accounts" ("team_id", "production_stripe_account_id", "staging_stripe_account_id")
SELECT "team_id", "production_stripe_account_id", "staging_stripe_account_id"
FROM "public"."team_integrations"
WHERE "production_stripe_account_id" IS NOT NULL
  OR "staging_stripe_account_id" IS NOT NULL;

-- Invoice details belong to either a team (for its main Stripe account) or one of its additional Stripe accounts
-- Keeping team_id null for additional accounts means teams.invoice_details still resolves to a single row
ALTER TABLE "public"."team_invoice_details" ALTER COLUMN "team_id" DROP NOT NULL;

ALTER TABLE "public"."team_invoice_details" ADD COLUMN "team_stripe_account_id" integer NULL UNIQUE;

ALTER TABLE "public"."team_invoice_details"
  ADD CONSTRAINT "team_invoice_details_team_stripe_account_id_fkey"
  FOREIGN KEY ("team_stripe_account_id") REFERENCES "public"."team_stripe_accounts"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."team_invoice_details"
  ADD CONSTRAINT "team_invoice_details_owner_check"
  CHECK (num_nonnulls("team_id", "team_stripe_account_id") = 1);

COMMENT ON COLUMN "public"."team_invoice_details"."team_stripe_account_id" IS E'Set for an additional Stripe account\'s invoice details, in place of team_id';

-- Platform admins can control whether a team is allowed to connect multiple stripe accounts
ALTER TABLE "public"."team_settings" ADD COLUMN "multiple_stripe_accounts_enabled" BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN "public"."team_settings"."multiple_stripe_accounts_enabled" IS E'Set by platform admins to allow a team to connect additional Stripe accounts';

-- Which stripe account the payment corresponds to is stored on the payment_status TABLE
-- can leave NULL if the team only has one stripe account
ALTER TABLE "public"."payment_status" ADD COLUMN "stripe_account_id" text NULL;

COMMENT ON COLUMN "public"."payment_status"."stripe_account_id" IS E'Stripe Connect account id (acct_...) the payment was made to';

-- Update the summary view
CREATE OR REPLACE VIEW "public"."teams_summary" AS
 SELECT t.id,
    t.name,
    t.slug,
    ts.reference_code,
    ts.homepage,
    t.domain AS subdomain,
    ts.has_article4_schema AS article_4s_enabled,
    jsonb_build_object('helpEmail', ts.help_email, 'helpPhone', ts.help_phone, 'emailReplyToId', ts.email_reply_to_id, 'helpOpeningHours', ts.help_opening_hours) AS govnotify_personalisation,
    (ti.staging_govpay_secret IS NOT NULL) AS govpay_enabled_staging,
    (ti.production_govpay_secret IS NOT NULL) AS govpay_enabled_production,
    NULL::text AS send_to_email_address,
    ti.staging_bops_submission_url AS bops_submission_url_staging,
    ti.production_bops_submission_url AS bops_submission_url_production,
    tt.logo,
    tt.favicon,
    tt.primary_colour,
    tt.link_colour,
    tt.action_colour,
    ((ti.staging_file_api_key IS NOT NULL) AND (ti.staging_power_automate_api_key IS NOT NULL) AND (ti.power_automate_webhook_url IS NOT NULL)) AS power_automate_enabled_staging,
    ((ti.production_file_api_key IS NOT NULL) AND (ti.production_power_automate_api_key IS NOT NULL) AND (ti.power_automate_webhook_url IS NOT NULL)) AS power_automate_enabled_production,
    flow_data.live_flows,
    ts.is_trial,
    ((ti.staging_file_api_key IS NOT NULL) AND (ti.staging_power_automate_api_key IS NOT NULL)) AS fme_enabled_staging,
    ((ti.production_file_api_key IS NOT NULL) AND (ti.production_power_automate_api_key IS NOT NULL)) AS fme_enabled_production,
    tsa.staging_stripe_account_id AS stripe_connected_staging,
    tsa.production_stripe_account_id AS stripe_connected_production,
    ts.payment_provider,
    service_charge_data.total_service_charges_collected,
    ts.is_guidance_only
   FROM teams t
     JOIN team_integrations ti ON ti.team_id = t.id
     JOIN team_themes tt ON tt.team_id = t.id
     JOIN team_settings ts ON ts.team_id = t.id
     LEFT JOIN team_stripe_accounts tsa ON ((tsa.team_id = t.id) AND (tsa.name IS NULL))
     LEFT JOIN LATERAL (
        SELECT SUM(service_charge_amount) AS total_service_charges_collected
        FROM service_charges sc
        WHERE ((sc.team_slug = t.slug))
     ) service_charge_data ON (TRUE)
     LEFT JOIN LATERAL (
        SELECT jsonb_agg(jsonb_build_object('name', f.name, 'firstOnlineAt', flow_first_online_at(f.*)) ORDER BY f.name) AS live_flows
        FROM flows f
        WHERE ((f.team_id = t.id) AND (f.status = 'online'::text) AND (f.archived_at IS NULL))
     ) flow_data ON (TRUE)
  WHERE t.category = 'lpa'
  ORDER BY t.name;
