alter table "public"."users" alter column "email" drop not null;
comment on column "public"."users"."email" is E'Create multiple entries if a user\'s email includes "." or "@googlemail.com"; set email to NULL to delete a user';
