-- Our nightly staging data sync truncates `flows`, but we want to persist
--   analytics, feedback, and payments so fkeys should have 'no action' rather than 'cascade'
alter table "public"."analytics" drop constraint "analytics_flow_id_fkey",
  add constraint "analytics_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update no action on delete no action;

alter table "public"."feedback" drop constraint "feedback_flow_id_fkey",
  add constraint "feedback_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update no action on delete no action;

alter table "public"."payment_status" drop constraint "payment_status_flow_id_fkey",
  add constraint "payment_status_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update no action on delete no action;
