alter table "public"."team_settings" add column "payment_provider" text null default null;

alter table "public"."team_settings"
  add constraint "team_settings_payment_provider_check"
  check ("payment_provider" in ('govpay', 'stripe'));

comment on column "public"."team_settings"."payment_provider" is E'Payment provider used to route applicant payments: govpay, stripe, or null.';

update "public"."team_settings" ts
set "payment_provider" = 'govpay'
from "public"."team_integrations" ti
where ts."team_id" = ti."team_id"
and ti."production_govpay_secret" is not null;
