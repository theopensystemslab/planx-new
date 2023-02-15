CREATE TABLE "public"."document_template" ("value" text NOT NULL, PRIMARY KEY ("value") );COMMENT ON TABLE "public"."document_template" IS E'Enum of predefined document templates available in @opensystemslab/planx-document-templates';

-- these values map to exposed templates in @opensystemslab/planx-document-templates

INSERT INTO "public"."document_template"("value") VALUES (E'_blank');

INSERT INTO "public"."document_template"("value") VALUES (E'LDCE');

INSERT INTO "public"."document_template"("value") VALUES (E'LDCE_redacted');
