alter table "public"."published_flows" add column "is_statutory_application_type" boolean default 'false';
 comment on column "public"."published_flows"."is_statutory_application_type" is E'This is updated on publish based on the flow graph containing application.type types that are in the ODP Schema';

