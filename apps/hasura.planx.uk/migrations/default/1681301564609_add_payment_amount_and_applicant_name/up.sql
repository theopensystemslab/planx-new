alter table "public"."payment_requests" add column "payment_amount" integer
 not null;

alter table "public"."payment_requests" add column "applicant_name" text
 not null;
