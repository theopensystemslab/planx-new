alter table "public"."payment_requests" add column "govpay_payment_id" text
 null unique;

comment on column "public"."payment_requests"."govpay_payment_id" is E'ID returned by GovPay when payment is initialised';