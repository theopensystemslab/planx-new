alter table "public"."flows" drop constraint "flows_email_template_fkey";
alter table "public"."flows" drop column "email_template";

DROP TABLE "public"."gov_notify_email_template_enum" CASCADE;
