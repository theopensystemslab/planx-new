alter table "public"."application_access_tokens" drop constraint "application_access_tokens_session_id_fkey",
  add constraint "application_access_tokens_session_id_fkey"
  foreign key ("session_id")
  references "public"."lowcal_sessions"
  ("id") on update no action on delete no action;
