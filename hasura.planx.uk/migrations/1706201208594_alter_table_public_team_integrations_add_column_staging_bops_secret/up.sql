alter table "public"."team_integrations" add column "staging_bops_secret" text
 null;

comment on column "public"."team_integrations"."staging_bops_secret" is E'Secret required for BOPS submission in the format <API_KEY>:<INITIALIZATION_VECTOR>';

alter table "public"."team_integrations" add column "production_bops_secret" text
 null;

comment on column "public"."team_integrations"."production_bops_secret" is E'Secret required for BOPS submission in the format <API_KEY>:<INITIALIZATION_VECTOR>';
