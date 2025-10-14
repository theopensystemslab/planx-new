alter table "public"."flows" add column "is_listed_on_lps" boolean
 not null default 'false';

comment on column "public"."flows"."is_listed_on_lps" is E'Controls if this flow can be listed on localplanning.services';