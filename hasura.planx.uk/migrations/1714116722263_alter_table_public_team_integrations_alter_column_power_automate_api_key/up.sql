alter table "public"."team_integrations" rename column "power_automate_api_key" to "staging_power_automate_api_key";
comment on column "public"."team_integrations"."staging_power_automate_api_key" is E'API key used to make authorised requests to the Power Automate Webhook URL stored in the format <API_KEY>:<INITIALIZATION_VECTOR>';

alter table "public"."team_integrations" add column "production_power_automate_api_key" text null;
comment on column "public"."team_integrations"."production_power_automate_api_key" is E'API key used to make authorised requests to the Power Automate Webhook URL stored in the format <API_KEY>:<INITIALIZATION_VECTOR>';
