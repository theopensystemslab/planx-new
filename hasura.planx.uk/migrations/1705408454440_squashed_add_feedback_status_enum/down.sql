DELETE FROM "public"."feedback_status" WHERE "value" = 'urgent';

DELETE FROM "public"."feedback_status" WHERE "value" = 'watch';

DELETE FROM "public"."feedback_status" WHERE "value" = 'maybe_in_future';

DELETE FROM "public"."feedback_status" WHERE "value" = 'no_action';

DELETE FROM "public"."feedback_status" WHERE "value" = 'doing';

DELETE FROM "public"."feedback_status" WHERE "value" = 'planned';

DELETE FROM "public"."feedback_status" WHERE "value" = 'done';

DROP TABLE "public"."feedback_status_enum";
