DROP TABLE "public"."user_roles";

DELETE FROM
  "public"."user_role_enum"
WHERE
  "value" = 'platform-manager';

DROP TABLE "public"."user_role_enum";


