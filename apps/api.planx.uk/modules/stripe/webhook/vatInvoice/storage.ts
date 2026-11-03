import { gql } from "graphql-request";

import { $api } from "../../../../client/index.js";
import { getFileFromS3 } from "../../../file/service/getFile.js";
import { uploadPrivateFile } from "../../../file/service/uploadFile.js";
import {
  buildFilePath,
  convertBufferToMulterFile,
} from "../../../file/service/utils.js";

/**
 * Each successful payment has (at most) one invoice of each kind
 *  - customer_invoice: covers every line of the payment, emailed to the payer
 *  - council_invoice: covers the council portion only, downloadable in the editor
 */
export type InvoiceKind = "customer_invoice" | "council_invoice";

/**
 * All monetary values are in pence
 */
export interface StoredInvoice {
  id: string;
  kind: InvoiceKind;
  stripePaymentIntentId: string;
  sessionId: string;
  flowId: string;
  teamId: number;
  invoiceNumber: string;
  issuedAt: string;
  net: number;
  vat: number;
  total: number;
  fileKey: string;
}

export type StoreInvoiceArgs = Omit<
  StoredInvoice,
  "id" | "issuedAt" | "fileKey"
> & {
  issuedAt: Date;
  pdf: Buffer;
};

/**
 * Invoices are kept under their own prefix, so they can have a separate retention period from other files
 */
const INVOICE_KEY_PREFIX = "invoices";

const STORED_INVOICE_FIELDS = `
  id
  kind
  stripePaymentIntentId: stripe_payment_intent_id
  sessionId: session_id
  flowId: flow_id
  teamId: team_id
  invoiceNumber: invoice_number
  issuedAt: issued_at
  net
  vat
  total
  fileKey: file_key
`;

export async function getStoredInvoice(
  stripePaymentIntentId: string,
  kind: InvoiceKind,
): Promise<StoredInvoice | null> {
  const { invoices } = await $api.client.request<{
    invoices: StoredInvoice[];
  }>(
    gql`
      query GetStoredInvoice($stripePaymentIntentId: String!, $kind: String!) {
        invoices: payment_invoices(
          where: {
            stripe_payment_intent_id: { _eq: $stripePaymentIntentId }
            kind: { _eq: $kind }
          }
          limit: 1
        ) {
          ${STORED_INVOICE_FIELDS}
        }
      }
    `,
    { stripePaymentIntentId, kind },
  );

  return invoices[0] ?? null;
}

/**
 * Upload an invoice PDF to S3 and record it in payment_invoices
 *
 * Callers should check getStoredInvoice() first, to avoid rendering a PDF which already exists
 *
 * Safe to retry - the S3 key is derived from the PaymentIntent and kind, so a retry overwrites the file rather
 * than leaving an orphan. If the invoice has already been recorded, the existing record is returned
 */
export async function storeInvoice({
  pdf,
  issuedAt,
  ...invoice
}: StoreInvoiceArgs): Promise<StoredInvoice> {
  const folder = `${INVOICE_KEY_PREFIX}/${invoice.stripePaymentIntentId}`;
  const filename = `${invoice.kind}.pdf`;

  // We generate invoices ourselves from database and Stripe data, so they don't need a malware scan
  await uploadPrivateFile(
    convertBufferToMulterFile(pdf, filename, "application/pdf"),
    filename,
    folder,
    { dangerouslySkipMalwareScan: true },
  );

  const { stored } = await $api.client.request<{
    stored: StoredInvoice | null;
  }>(
    gql`
      mutation InsertPaymentInvoice($invoice: payment_invoices_insert_input!) {
        stored: insert_payment_invoices_one(
          object: $invoice
          on_conflict: {
            constraint: payment_invoices_stripe_payment_intent_id_kind_key
            update_columns: []
          }
        ) {
          ${STORED_INVOICE_FIELDS}
        }
      }
    `,
    {
      invoice: {
        kind: invoice.kind,
        stripe_payment_intent_id: invoice.stripePaymentIntentId,
        session_id: invoice.sessionId,
        flow_id: invoice.flowId,
        team_id: invoice.teamId,
        invoice_number: invoice.invoiceNumber,
        issued_at: issuedAt.toISOString(),
        net: invoice.net,
        vat: invoice.vat,
        total: invoice.total,
        file_key: buildFilePath(folder, filename),
      },
    },
  );

  if (stored) return stored;

  // Already recorded (e.g. a concurrent retry got there first)
  const existing = await getStoredInvoice(
    invoice.stripePaymentIntentId,
    invoice.kind,
  );
  if (!existing) {
    throw new Error(
      `Could not record ${invoice.kind} for PaymentIntent ${invoice.stripePaymentIntentId}`,
    );
  }

  return existing;
}

/**
 * Fetch a stored invoice PDF from S3
 */
export async function getInvoicePdf(fileKey: string): Promise<Buffer> {
  const file = await getFileFromS3(fileKey);

  if (file.outcome !== "ok") {
    throw new Error(
      `Could not fetch invoice ${fileKey} from S3 (${file.outcome})`,
    );
  }

  return file.body;
}
