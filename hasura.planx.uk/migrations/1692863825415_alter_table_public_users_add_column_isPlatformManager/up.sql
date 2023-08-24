alter table "public"."users" add column "isPlatformAdmin" boolean
 not null default 'false';

comment on column "public"."users"."isPlatformAdmin" is E'A Platform Admin is the highest level of permission in PlanX, and can operate across all teams';