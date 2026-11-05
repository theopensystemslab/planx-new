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
  "file_key" TEXT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("stripe_payment_intent_id", "kind"),
  UNIQUE ("invoice_number"),
  CHECK ("kind" IN ('payer_invoice', 'council_invoice')),
  FOREIGN KEY ("team_id") REFERENCES "public"."teams" ("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX "payment_invoices_session_id_idx" ON "public"."payment_invoices" ("session_id");

COMMENT ON TABLE "public"."payment_invoices" IS E'Invoices generated for successful Stripe payments, stored as PDFs in S3. Kept separately from session data, which has a shorter retention period';
COMMENT ON COLUMN "public"."payment_invoices"."kind" IS E'payer_invoice: VAT receipt from the council to the payer, covering every line of the payment, attached to the payment confirmation email. council_invoice: VAT invoice from OSL to the council for the service charge, downloadable in the editor, never emailed';
COMMENT ON COLUMN "public"."payment_invoices"."session_id" IS E'No foreign key - invoices must outlive session sanitisation';
COMMENT ON COLUMN "public"."payment_invoices"."flow_id" IS E'No foreign key - invoices must outlive the flow';
COMMENT ON COLUMN "public"."payment_invoices"."invoice_number" IS E'Set by the set_payment_invoice_number trigger, e.g. PX-2026-INV-BNE-00001';
COMMENT ON COLUMN "public"."payment_invoices"."net" IS E'Pence';
COMMENT ON COLUMN "public"."payment_invoices"."vat" IS E'Pence';
COMMENT ON COLUMN "public"."payment_invoices"."total" IS E'Pence';
COMMENT ON COLUMN "public"."payment_invoices"."file_key" IS E'S3 object key of the invoice PDF (private, not a URL). Null until the PDF has been generated and uploaded';

-- Used to track where we are at in the invoice sequence for each prefix
CREATE TABLE "public"."invoice_number_sequences" (
  "prefix" TEXT NOT NULL,
  "last_number" INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY ("prefix")
);

COMMENT ON TABLE "public"."invoice_number_sequences" IS E'The last invoice number issued for each prefix (e.g. PX-2026-INV-BNE). A new year gives a new prefix, so numbering restarts each calendar year';

-- Invoice numbers must be sequential with no gaps, so they are allocated here rather than by the API
--   <PX|OSL>-<year>-INV-<team reference code>-<5+ digit number>
--   e.g. PX-2026-INV-BNE-00001 (payer_invoice), OSL-2026-INV-BNE-00001 (council_invoice)
-- Each kind has its own sequence, so the numbers for a payment's two invoices won't necessarily match
CREATE FUNCTION "public"."set_payment_invoice_number"() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  _reference TEXT;
  _prefix TEXT;
  _number INTEGER;
  _existing_invoice_number TEXT;
BEGIN
  -- Fall back to the team slug if the team has no reference code
  SELECT COALESCE(NULLIF(TRIM(ts.reference_code), ''), UPPER(t.slug))
  INTO _reference
  FROM "public"."teams" t
  LEFT JOIN "public"."team_settings" ts ON ts.team_id = t.id
  WHERE t.id = NEW.team_id;

  _prefix := CASE NEW.kind WHEN 'payer_invoice' THEN 'PX' ELSE 'OSL' END
    || '-' || EXTRACT(YEAR FROM NEW.issued_at AT TIME ZONE 'Europe/London')::TEXT
    || '-INV-' || _reference;

  -- Lock this prefix's sequence, so concurrent inserts are numbered one at a time
  INSERT INTO "public"."invoice_number_sequences" ("prefix") VALUES (_prefix)
  ON CONFLICT ("prefix") DO NOTHING;

  SELECT last_number INTO _number
  FROM "public"."invoice_number_sequences"
  WHERE prefix = _prefix
  FOR UPDATE;

  -- Already invoiced - this insert will hit the (stripe_payment_intent_id, kind) unique constraint,
  -- so reuse the existing number rather than using up a new one
  SELECT invoice_number INTO _existing_invoice_number
  FROM "public"."payment_invoices"
  WHERE stripe_payment_intent_id = NEW.stripe_payment_intent_id
    AND kind = NEW.kind;

  IF _existing_invoice_number IS NOT NULL THEN
    NEW.invoice_number := _existing_invoice_number;
    RETURN NEW;
  END IF;

  _number := _number + 1;

  UPDATE "public"."invoice_number_sequences"
  SET last_number = _number
  WHERE prefix = _prefix;

  NEW.invoice_number := _prefix || '-' || LPAD(_number::TEXT, GREATEST(5, LENGTH(_number::TEXT)), '0');

  RETURN NEW;
END;
$$;

CREATE TRIGGER "set_payment_invoice_number"
BEFORE INSERT ON "public"."payment_invoices"
FOR EACH ROW EXECUTE FUNCTION "public"."set_payment_invoice_number"();
