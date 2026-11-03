CREATE TABLE "public"."payment_invoices" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "kind" TEXT NOT NULL,
  "stripe_payment_intent_id" TEXT NOT NULL,
  "session_id" UUID NOT NULL,
  "flow_id" UUID NOT NULL,
  "team_id" INTEGER NOT NULL,
  "invoice_number" TEXT NOT NULL,
  "issued_at" TIMESTAMPTZ NOT NULL,
  "net" INTEGER NOT NULL,
  "vat" INTEGER NOT NULL,
  "total" INTEGER NOT NULL,
  "file_key" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("stripe_payment_intent_id", "kind"),
  CHECK ("kind" IN ('customer_invoice', 'council_invoice')),
  FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX "payment_invoices_session_id_idx" ON "public"."payment_invoices" ("session_id");

COMMENT ON TABLE "public"."payment_invoices" IS E'Invoices generated for successful Stripe payments, stored as PDFs in S3. Kept separately from session data, which has a shorter retention period';
COMMENT ON COLUMN "public"."payment_invoices"."kind" IS E'customer_invoice: VAT invoice for the payer, covering every line of the payment, attached to the payment confirmation email. council_invoice: the council portion of the payment, downloadable in the editor, never emailed';
COMMENT ON COLUMN "public"."payment_invoices"."session_id" IS E'No foreign key - invoices must outlive session sanitisation';
COMMENT ON COLUMN "public"."payment_invoices"."flow_id" IS E'No foreign key - invoices must outlive the flow';
COMMENT ON COLUMN "public"."payment_invoices"."net" IS E'Pence';
COMMENT ON COLUMN "public"."payment_invoices"."vat" IS E'Pence';
COMMENT ON COLUMN "public"."payment_invoices"."total" IS E'Pence';
COMMENT ON COLUMN "public"."payment_invoices"."file_key" IS E'S3 object key of the invoice PDF (private, not a URL)';
