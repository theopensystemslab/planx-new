alter table "public"."team_settings" drop constraint "team_settings_payment_provider_check";

alter table "public"."team_settings" drop column "payment_provider";
