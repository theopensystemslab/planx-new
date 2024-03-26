alter table "public"."payment_requests" add column "govpay_metadata" jsonb
 not null default '[]';
