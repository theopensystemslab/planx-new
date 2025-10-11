alter table "public"."team_integrations" add column "power_automate_api_key" text null;
comment on column "public"."team_integrations"."power_automate_api_key" is E'API key used to make authorised requests to the Power Automate Webhook URL stored in the format <API_KEY>:<INITIALIZATION_VECTOR>';
