CREATE TABLE "public"."document_template" ("value" text NOT NULL, PRIMARY KEY ("value") );COMMENT ON TABLE "public"."document_template" IS E'Enum of predefined document templates available in @opensystemslab/planx-document-templates';

INSERT INTO "public"."document_template"("value") VALUES (E'LDCP');

INSERT INTO "public"."document_template"("value") VALUES (E'LDCP_redacted');

INSERT INTO "public"."document_template"("value") VALUES (E'LDCE');

INSERT INTO "public"."document_template"("value") VALUES (E'LDCE_redacted');
