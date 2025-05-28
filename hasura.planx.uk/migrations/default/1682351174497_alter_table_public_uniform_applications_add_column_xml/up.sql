alter table "public"."uniform_applications" add column "xml" xml
 null;

comment on column "public"."uniform_applications"."xml" is E'OneApp XML generated for this application';