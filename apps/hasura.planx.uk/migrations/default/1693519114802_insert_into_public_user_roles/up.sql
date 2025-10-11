INSERT INTO "public"."user_roles"("value") VALUES (E'teamEditor');

DELETE FROM "public"."user_roles" WHERE "value" = 'teamAdmin';