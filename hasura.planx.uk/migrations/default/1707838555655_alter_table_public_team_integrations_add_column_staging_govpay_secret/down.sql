comment on column "public"."team_integrations"."staging_govpay_secret" is NULL;
comment on column "public"."team_integrations"."production_govpay_secret" is NULL;

ALTER table "public"."team_integrations" DROP COLUMN "staging_govpay_secret";
ALTER table "public"."team_integrations" DROP COLUMN "production_govpay_secret";