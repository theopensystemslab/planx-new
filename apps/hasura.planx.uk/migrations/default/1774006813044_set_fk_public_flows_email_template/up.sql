alter table "public"."flows" add column "email_template" text
 not null default 'application';

alter table "public"."flows"
  add constraint "flows_email_template_fkey"
  foreign key ("email_template")
  references "public"."gov_notify_email_template_enum"
  ("value") on update no action on delete no action;

CREATE TABLE "public"."gov_notify_email_template_enum" (
  "value" text NOT NULL, 
  "column" text NOT NULL, 
  PRIMARY KEY ("value") , 
  UNIQUE ("value"));
COMMENT ON TABLE "public"."gov_notify_email_template_enum" IS E'Enum of available GOV.UK Notify email template groups';

INSERT INTO "public"."gov_notify_email_template_enum"("value", "column") VALUES (E'generic', E'Email templates which use generic "submission" language, most suitable for discretionary services');

INSERT INTO "public"."gov_notify_email_template_enum"("value", "column") VALUES (E'application', E'Email templates which use "application" language, most suitable for statutory services');
