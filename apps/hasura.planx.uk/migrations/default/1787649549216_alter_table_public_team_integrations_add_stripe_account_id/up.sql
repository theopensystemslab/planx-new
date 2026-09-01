alter table "public"."team_integrations" add column "production_stripe_account_id" text;
alter table "public"."team_integrations" add column "staging_stripe_account_id" text;

comment on column "public"."team_integrations"."production_stripe_account_id" is E'Stripe Connect account id (acct_...) linked via OAuth for production payments';
comment on column "public"."team_integrations"."staging_stripe_account_id" is E'Stripe Connect account id (acct_...) linked via OAuth for staging payments';
