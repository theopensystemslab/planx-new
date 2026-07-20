alter table "public"."flows" add column "is_pattern" boolean
 not null default 'false';
alter table "public"."flows" add constraint "pattern_check" check (is_pattern = TRUE
 AND templated_from IS NULL
 AND is_template = FALSE
 AND is_service = FALSE
 AND is_listed_on_lps = FALSE
OR is_pattern = FALSE);
