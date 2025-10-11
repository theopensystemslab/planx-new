alter table "public"."templated_flow_edits" drop constraint "templated_flow_edits_node_id_flow_id_key";
alter table "public"."templated_flow_edits" add constraint "templated_flow_edits_flow_id_key" unique ("flow_id");
alter table "public"."templated_flow_edits" drop column "node_id" cascade;
alter table "public"."templated_flow_edits" rename column "node_data" to "data";
