CREATE TABLE "public"."payment_status_enum" ("value" text NOT NULL, "comment" text NOT NULL, PRIMARY KEY ("value") );

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'created', E'pending payment created');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'started', E'pending payment with some user details entered');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'submitted', E'pending payment authorised but not yet confirmed by the user');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'capturable', E'pending payment authorized and confirmed by the user');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'success', E'payment completed');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'failed', E'payment failed');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'cancelled', E'payment cancelled');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'error', E'payment failed due to a system error');

INSERT INTO "public"."payment_status_enum" ("value", "comment") VALUES (E'unknown', E'status not known');
