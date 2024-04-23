alter table "public"."team_integrations" 
add column staging_file_api_key text null,
add column production_file_api_key text null,
add column power_automate_webhook_url text null;

comment on column "public"."team_integrations"."staging_file_api_key" is E'Secret allowing a council to download private S3 user files via the Planx API in the format <API_KEY>:<INITIALIZATION_VECTOR>';
comment on column "public"."team_integrations"."production_file_api_key" is E'Secret allowing a council to download private S3 user files via the Planx API in the format <API_KEY>:<INITIALIZATION_VECTOR>';
comment on column "public"."team_integrations"."power_automate_webhook_url" is E'Webhook URL used to notify and trigger council-managed MS Power Automate scripts to process submissions';
