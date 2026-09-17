alter table "public"."team_settings" add column "payment_provider" text null default null;

alter table "public"."team_settings"
  add constraint "team_settings_payment_provider_check"
  check ("payment_provider" in ('govpay', 'stripe'));

comment on column "public"."team_settings"."payment_provider" is E'Payment provider used to route applicant payments: govpay, stripe, or null.';
