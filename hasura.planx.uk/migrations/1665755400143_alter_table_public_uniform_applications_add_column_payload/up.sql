alter table "public"."uniform_applications" add column "payload" jsonb null;

comment on column "public"."uniform_applications"."payload" is E'Payload which generated this submission to Uniform';