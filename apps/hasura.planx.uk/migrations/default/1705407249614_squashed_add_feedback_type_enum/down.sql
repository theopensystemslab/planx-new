
DELETE FROM "public"."feedback_type_enum" WHERE "value" = 'helpful';

DELETE FROM "public"."feedback_type_enum" WHERE "value" = 'unhelpful';

DELETE FROM "public"."feedback_type_enum" WHERE "value" = 'comment';

DELETE FROM "public"."feedback_type_enum" WHERE "value" = 'idea';

DELETE FROM "public"."feedback_type_enum" WHERE "value" = 'issue';

DROP TABLE "public"."feedback_type_enum";
