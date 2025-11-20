alter table "public"."flows" add column "category" text
 null;

comment on column "public"."flows"."category" is E'Category for grouping (on LPS) or filtering within PlanX. Currently "guidance", "notify" and "apply" are options.';
