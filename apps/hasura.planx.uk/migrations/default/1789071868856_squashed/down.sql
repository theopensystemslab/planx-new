-- PAYMENT REQUESTS
alter table "public"."payment_requests" drop constraint "single_provider_metadata_or_neither";
alter table "public"."payment_requests" drop constraint "single_provider_id_or_neither";
alter table "public"."payment_requests" drop column "stripe_payment_id";
alter table "public"."payment_requests" drop column "stripe_metadata";

-- STRIPE PAYMENT STATUS ENUM
alter table "public"."payment_status" drop constraint "payment_status_stripe_status_fkey";
DELETE FROM "public"."stripe_payment_status_enum" WHERE "value" = 'created';
DROP TABLE "public"."stripe_payment_status_enum" cascade;
comment on table "public"."payment_status_enum" is NULL;

-- PAYMENT STATUS
alter table "public"."payment_status" drop constraint "single_provider_id";
alter table "public"."payment_status" drop constraint "single_provider_status";
alter table "public"."payment_status" drop constraint "single_provider_metadata";

alter table "public"."payment_status" drop column "stripe_payment_id";
alter table "public"."payment_status" drop column "stripe_status";
alter table "public"."payment_status" drop column "stripe_metadata";
 
comment on column "public"."payment_status"."status" is NULL;
alter table "public"."payment_status" alter column "status" set not null;

comment on column "public"."payment_status"."payment_id" is NULL;
alter table "public"."payment_status" alter column "payment_id" set not null;
