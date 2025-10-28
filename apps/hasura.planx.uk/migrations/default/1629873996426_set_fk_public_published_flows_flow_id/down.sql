alter table "public"."published_flows" drop constraint "published_flows_flow_id_fkey",
          add constraint "published_flows_flow_id_fkey"
          foreign key ("flow_id")
          references "public"."flows"
          ("id")
          on update restrict
          on delete restrict;
