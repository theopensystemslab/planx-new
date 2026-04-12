CREATE TABLE "public"."notification_type_enum" (
  "value" text NOT NULL, 
  "comment" text NOT NULL, 
PRIMARY KEY ("value"), 
UNIQUE ("value")
);

COMMENT ON TABLE "public"."notification_type_enum" IS E'An enum for tracking types of in-platform notifications';

INSERT INTO "public"."notification_type_enum"("value", "comment") 
VALUES (E'updated_templated_flow', E'Templated flow has updated and is ready to review and publish');

CREATE TABLE "public"."notifications" (
  "id" serial NOT NULL, 
  "flow_id" uuid NOT NULL, 
  "team_id" integer NOT NULL, 
  "created_at" timestamp NOT NULL DEFAULT now(), 
  "resolved_at" timestamp, 
  "type" text NOT NULL, 
PRIMARY KEY ("id"), 
UNIQUE ("id")
);

ALTER TABLE "public"."notifications"
  add constraint "notifications_type_fkey"
  foreign key ("type")
  references "public"."notification_type_enum"
  ("value") on update no action on delete no action;
