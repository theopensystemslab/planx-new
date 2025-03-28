alter table "public"."flows" add column "can_create_from_copy" boolean
 not null default 'false';

comment on column "public"."flows"."can_create_from_copy" is E'Controlls if this flow can be used (as a copy) to instantiate a new flow for another team.';