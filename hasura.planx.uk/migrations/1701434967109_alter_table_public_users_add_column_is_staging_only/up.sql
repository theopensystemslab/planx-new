alter table "public"."users" add column "is_staging_only" boolean
 not null default 'false';

comment on column "public"."users"."is_staging_only" is E 'Controls if this user can access all environments. Some users are restricted to Pizza / Staging environments only.';