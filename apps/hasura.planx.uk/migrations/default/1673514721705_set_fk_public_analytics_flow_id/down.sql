alter table "public"."analytics" drop constraint "analytics_flow_id_fkey",
  add constraint "analytics_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update restrict on delete restrict;

alter table "public"."analytics_logs" drop constraint "analytics_logs_analytics_id_fkey",
  add constraint "analytics_log_analytics_id_fkey"
  foreign key ("analytics_id")
  references "public"."analytics"
  ("id") on update cascade on delete set null;
