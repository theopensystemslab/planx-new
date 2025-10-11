alter table "public"."teams" add column "reference_code" text null;
comment on column "public"."teams"."reference_code" is E'Organisation reference code sourced from planning.data.gov.uk/dataset/local-authority';
