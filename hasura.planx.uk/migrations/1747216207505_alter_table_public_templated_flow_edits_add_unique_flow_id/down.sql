alter table "public"."templated_flow_edits" drop constraint "templated_flow_edits_flow_id_key";
alter table "public"."templated_flow_edits" add constraint "templated_flow_edits_node_id_flow_id_key" unique ("node_id", "flow_id");
comment on column "public"."templated_flow_edits"."node_id" is E'Changes made to a templated flow\'s customisable nodes. These customisations are reconciled with the source template to generate a customised flow.';
alter table "public"."templated_flow_edits" alter column "node_id" drop not null;
alter table "public"."templated_flow_edits" add column "node_id" text;
alter table "public"."templated_flow_edits" rename column "data" to "node_data";
