
CREATE TABLE "public"."feedback_type_enum" ("value" text NOT NULL, "comment" text NOT NULL, PRIMARY KEY ("value") );COMMENT ON TABLE "public"."feedback_type_enum" IS E'Store the different types of feedback we gather from user';

INSERT INTO "public"."feedback_type_enum"("value", "comment") VALUES (E'issue', E' A user reporting an issue with a service');

INSERT INTO "public"."feedback_type_enum"("value", "comment") VALUES (E'idea', E'A user has shared an idea');

INSERT INTO "public"."feedback_type_enum"("value", "comment") VALUES (E'comment', E'A user has shared a comment on a service');

INSERT INTO "public"."feedback_type_enum"("value", "comment") VALUES (E'unhelpful', E'A user has fed back that help text was unhelpful');

INSERT INTO "public"."feedback_type_enum"("value", "comment") VALUES (E'helpful', E'A user has fed back that help text was helpful');
