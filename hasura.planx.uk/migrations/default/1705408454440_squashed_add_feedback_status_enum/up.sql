
CREATE TABLE "public"."feedback_status_enum" ("value" text NOT NULL, "comment" text NOT NULL, PRIMARY KEY ("value") , UNIQUE ("value"));COMMENT ON TABLE "public"."feedback_status_enum" IS E'An enum for tracking the status of received feedback';

INSERT INTO "public"."feedback_status_enum"("value", "comment") VALUES (E'done', E'Any related actions have been completed');

INSERT INTO "public"."feedback_status_enum"("value", "comment") VALUES (E'planned', E'Related actions have been planned');

INSERT INTO "public"."feedback_status_enum"("value", "comment") VALUES (E'doing', E'Related actions are in progress');

INSERT INTO "public"."feedback_status_enum"("value", "comment") VALUES (E'no_action', E'It has been deemed there are no related actions');

INSERT INTO "public"."feedback_status_enum"("value", "comment") VALUES (E'maybe_in_future', E'Related actions might be considered in the future');

INSERT INTO "public"."feedback_status_enum"("value", "comment") VALUES (E'watch', E'Feedback of this time should be monitored');

INSERT INTO "public"."feedback_status_enum"("value", "comment") VALUES (E'urgent', E'This issue has been deemed urgent and related actions should be completed asap');

