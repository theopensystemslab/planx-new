alter table "public"."session_backups"
           add constraint "session_backups_flow_id_fkey"
           foreign key ("flow_id")
           references "public"."flows"
           ("id") on update no action on delete no action;
