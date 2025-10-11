alter table "public"."analytics" add column "user_agent" jsonb
 null default '{}';

alter table "public"."analytics" add column "referrer" text
 null;