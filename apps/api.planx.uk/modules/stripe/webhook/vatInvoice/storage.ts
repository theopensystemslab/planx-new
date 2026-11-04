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
 *  - payer_invoice: issued by the council to the payer, covering every line of the payment
 *  - council_invoice: issued by OSL to the council, covering the service charge
 */
export type InvoiceKind = "payer_invoice" | "council_invoice";

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
  /** Null until the PDF has been generated and stored */
  fileKey: string | null;
}

export type ReserveInvoiceArgs = Omit<
  StoredInvoice,
  "id" | "invoiceNumber" | "issuedAt" | "fileKey"
> & {
  issuedAt: Date;
};

/**
 * Invoices live in the dedicated payment-data bucket, so retention and access are managed there rather than by prefix
 *
 * Keys are scoped by team first (see ADR 0012), so access can later be limited per-team, e.g. for integrations
 */
const INVOICE_BUCKET = "payment-data";

const getInvoiceFolder = (teamSlug: string, stripePaymentIntentId: string) =>
  `${teamSlug}/${stripePaymentIntentId}`;

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
 * Every invoice recorded for a payment, customer invoice first
 */
export async function getStoredInvoices(
  stripePaymentIntentId: string,
): Promise<StoredInvoice[]> {
  const { invoices } = await $api.client.request<{
    invoices: StoredInvoice[];
  }>(
    gql`
      query GetStoredInvoices($stripePaymentIntentId: String!) {
        invoices: payment_invoices(
          where: { stripe_payment_intent_id: { _eq: $stripePaymentIntentId } }
          order_by: { kind: desc }
        ) {
          ${STORED_INVOICE_FIELDS}
        }
      }
    `,
    { stripePaymentIntentId },
  );

  return invoices;
}

/**
 * Record an invoice in payment_invoices, which allocates its invoice number at DB level (see set_payment_invoice_number)
 *
 * Numbers are sequential, so they're allocated before the PDF is rendered - attach the PDF afterwards with storeInvoicePdf()
 *
 * Safe to retry - if the invoice has already been recorded, the existing record (and its number) is returned
 */
export async function reserveInvoice({
  issuedAt,
  ...invoice
}: ReserveInvoiceArgs): Promise<StoredInvoice> {
  const { reserved } = await $api.client.request<{
    reserved: StoredInvoice | null;
  }>(
    gql`
      mutation ReservePaymentInvoice($invoice: payment_invoices_insert_input!) {
        reserved: insert_payment_invoices_one(
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
        issued_at: issuedAt.toISOString(),
        net: invoice.net,
        vat: invoice.vat,
        total: invoice.total,
      },
    },
  );

  // newly created invoice row - return it
  if (reserved) return reserved;

  // row already exists so fetch it - this path is an unlikely race condition
  // existing row not returned by prev query because of ON CONFLICT DO NOTHING
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
 * Upload an invoice PDF to the payment-data bucket and attach it to the invoice's record
 *
 * Stored at `{teamSlug}/{stripePaymentIntentId}/{kind}.pdf`
 *
 * Safe to retry - the S3 key is derived from the team, PaymentIntent and kind, so a retry overwrites the file rather
 * than leaving an orphan. A PDF can only be attached once
 */
export async function storeInvoicePdf(
  invoice: StoredInvoice,
  teamSlug: string,
  pdf: Buffer,
): Promise<StoredInvoice> {
  const folder = getInvoiceFolder(teamSlug, invoice.stripePaymentIntentId);
  const filename = `${invoice.kind}.pdf`;

  // We generate invoices ourselves from database and Stripe data, so they don't need a malware scan
  await uploadPrivateFile(
    convertBufferToMulterFile(pdf, filename, "application/pdf"),
    filename,
    folder,
    { dangerouslySkipMalwareScan: true },
    INVOICE_BUCKET,
  );

  const { stored } = await $api.client.request<{
    stored: StoredInvoice | null;
  }>(
    gql`
      mutation AttachPaymentInvoicePdf($id: uuid!, $fileKey: String!) {
        stored: update_payment_invoices_by_pk(
          pk_columns: { id: $id }
          _set: { file_key: $fileKey }
        ) {
          ${STORED_INVOICE_FIELDS}
        }
      }
    `,
    { id: invoice.id, fileKey: buildFilePath(folder, filename) },
  );

  if (!stored) {
    throw new Error(
      `Could not attach PDF to ${invoice.kind} ${invoice.invoiceNumber} - it may already have one`,
    );
  }

  return stored;
}

/**
 * Fetch a stored invoice PDF from the payment-data bucket
 */
export async function getInvoicePdf(fileKey: string): Promise<Buffer> {
  const file = await getFileFromS3(fileKey, INVOICE_BUCKET);

  if (file.outcome !== "ok") {
    throw new Error(
      `Could not fetch invoice ${fileKey} from S3 (${file.outcome})`,
    );
  }

  return file.body;
}
