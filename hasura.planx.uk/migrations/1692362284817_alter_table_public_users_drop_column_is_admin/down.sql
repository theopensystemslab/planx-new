comment on column "public"."users"."is_admin" is E'Grants access to the Editor, currently requires a Google email for single sign-on';
alter table "public"."users" alter column "is_admin" set default false;
alter table "public"."users" alter column "is_admin" drop not null;
alter table "public"."users" add column "is_admin" bool;
