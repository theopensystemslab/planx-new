alter table "public"."operations" drop constraint "operations_flow_id_fkey",
             add constraint "operations_flow_id_fkey"
             foreign key ("flow_id")
             references "public"."flows"
             ("id") on update restrict on delete cascade;
