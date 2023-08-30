alter table "public"."payment_status" add column "amount" integer
 null;

comment on column "public"."payment_status"."amount" is E'Value in pence of payment amount';