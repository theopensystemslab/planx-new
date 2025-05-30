alter table "public"."teams" add column "submission_email" text null;
comment on column "public"."teams"."submission_email" is E'Referenced by Send component when configured to email planning office';
