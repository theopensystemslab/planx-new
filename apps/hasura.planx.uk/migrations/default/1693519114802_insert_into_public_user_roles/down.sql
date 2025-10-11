INSERT INTO "public"."user_roles"("value") VALUES (E'teamAdmin');

DELETE FROM "public"."user_roles" WHERE "value" = 'teamEditor';