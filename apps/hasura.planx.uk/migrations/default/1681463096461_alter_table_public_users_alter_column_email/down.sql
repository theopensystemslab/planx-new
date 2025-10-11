comment on column "public"."users"."email" is E'Create multiple entries if a user\'s email includes "." or "@googlemail.com"; replace address with "_REMOVED_" to restrict access but retain their edits/`operations` until soft deletes are implemented';
alter table "public"."users" alter column "email" set not null;
