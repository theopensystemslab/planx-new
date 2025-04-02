UPDATE feedback SET status = 'actioned';

alter table "public"."feedback" alter column "status" set not null;