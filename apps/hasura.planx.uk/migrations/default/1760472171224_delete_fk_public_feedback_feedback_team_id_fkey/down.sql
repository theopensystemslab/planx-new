alter table "public"."feedback"
  add constraint "feedback_team_id_fkey"
  foreign key ("team_id")
  references "public"."teams"
  ("id") on update restrict on delete restrict;
