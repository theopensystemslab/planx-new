alter table "public"."flows" add column "is_service" boolean
 not null default 'false';

UPDATE "public"."flows" SET is_service = true
    WHERE "public"."flows"."status" = 'online';
