alter table "public"."feedback" drop constraint "feedback_flow_id_fkey",
  add constraint "feedback_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update restrict on delete restrict;
