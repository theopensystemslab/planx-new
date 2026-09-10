-- PAYMENT REQUESTS: new columns and constraints
alter table "public"."payment_requests" 
add column "stripe_payment_id" text null unique;

alter table "public"."payment_requests" 
add column "stripe_metadata" jsonb not null default '[]'::jsonb;

-- payment_id and payment_metadata are nullable until ITP request is paid, so check needs to allow both null or max one not-null
alter table "public"."payment_requests" 
add constraint "single_provider_id_or_neither" 
check (num_nonnulls(govpay_payment_id, stripe_payment_id) <= 1);

alter table "public"."payment_requests" 
add constraint "single_provider_metadata_or_neither" 
check (num_nonnulls(govpay_metadata, stripe_metadata) <= 1);

-- PAYMENT STATUS: new columns, constraints, and new enum table fkey
alter table "public"."payment_status" 
add column "stripe_metadata" jsonb null;

alter table "public"."payment_status" 
add column "stripe_payment_id" text null;

alter table "public"."payment_status" 
add column "stripe_status" text null;

-- Existing columns need to become nullable, with exactly one not-null constraint instead
alter table "public"."payment_status" 
alter column "payment_id" drop not null;
comment on column "public"."payment_status"."payment_id" is E'gov_pay_payment_id';

alter table "public"."payment_status" 
alter column "status" drop not null;
comment on column "public"."payment_status"."status" is E'gov_pay_status';

alter table "public"."payment_status" 
add constraint "single_provider_id" 
check (num_nonnulls(payment_id, stripe_payment_id) = 1);

alter table "public"."payment_status" 
add constraint "single_provider_status" 
check (num_nonnulls(status, stripe_status) = 1);

alter table "public"."payment_status" 
add constraint "single_provider_metadata" 
check (num_nonnulls(gov_pay_metadata, stripe_metadata) = 1);

-- Create new enum table for Stripe, one existing record is required to toggle "Set table as enum" in console
comment on table "public"."payment_status_enum" is E'GOV.UK Pay statuses';

CREATE TABLE "public"."stripe_payment_status_enum" (
  "value" text NOT NULL, 
  "comment" text NOT NULL, 
  PRIMARY KEY ("value") , 
  UNIQUE ("value")
);
COMMENT ON TABLE "public"."stripe_payment_status_enum" IS E'Stripe statuses';

INSERT INTO "public"."stripe_payment_status_enum"("value", "comment") 
VALUES (E'created', E'pending payment created');

alter table "public"."payment_status"
  add constraint "payment_status_stripe_status_fkey"
  foreign key ("stripe_status")
  references "public"."stripe_payment_status_enum"
  ("value") on update cascade on delete no action;
