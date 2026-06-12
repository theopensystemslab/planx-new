-- When flow records are deleted, cascade to notifications (this means notifications will not persist on staging, but be reset nightly)
alter table "public"."notifications"
  add constraint "notifications_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update cascade on delete cascade;
