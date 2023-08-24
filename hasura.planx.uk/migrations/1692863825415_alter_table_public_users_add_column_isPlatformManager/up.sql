alter table "public"."users" add column "is_platform_admin" boolean
 not null default 'false';

comment on column "public"."users"."is_platform_admin" is E'A Platform Admin is the highest level of permission in PlanX, and can operate across all teams';