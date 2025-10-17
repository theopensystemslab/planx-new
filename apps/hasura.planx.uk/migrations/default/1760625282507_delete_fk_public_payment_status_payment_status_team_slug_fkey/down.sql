alter table "public"."analytics"
  add constraint "analytics_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update cascade on delete cascade;

alter table "public"."payment_status"
  add constraint "payment_status_flow_id_fkey"
  foreign key ("flow_id")
  references "public"."flows"
  ("id") on update cascade on delete cascade;

alter table "public"."payment_status"
  add constraint "payment_status_team_slug_fkey"
  foreign key ("team_slug")
  references "public"."teams"
  ("slug") on update cascade on delete cascade;
