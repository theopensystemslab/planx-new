alter table "public"."users" add column "is_analyst" boolean
 not null default 'false';

comment on column "public"."users"."is_analyst" is E'Analyst is a role granting read-only access to the admin panel';
