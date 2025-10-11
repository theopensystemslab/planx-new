CREATE TABLE "public"."flow_schemas"("flow_id" uuid NOT NULL, "node" text NOT NULL, "type" integer NOT NULL, "text" text NOT NULL, "planx_variable" text NOT NULL, PRIMARY KEY ("flow_id","node") );
