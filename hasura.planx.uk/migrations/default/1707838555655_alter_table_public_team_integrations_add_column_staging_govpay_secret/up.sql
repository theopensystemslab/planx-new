alter table "public"."team_integrations" add column "staging_govpay_secret" text
 null;

comment on column "public"."team_integrations"."staging_govpay_secret" is E'Secret required for GovPay submissions in the format <TOKEN>:<INITIALIZATION_VECTOR>';

alter table "public"."team_integrations" add column "production_govpay_secret" text
 null;

comment on column "public"."team_integrations"."production_govpay_secret" is E'Secret required for GovPay submission in the format <API_KEY>:<INITIALIZATION_VECTOR>';
