import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { ServerError } from "../../../errors/serverError.js";
import type {
  InvoiceKind,
  StoredInvoice,
} from "../../stripe/webhook/vatInvoice/storage.js";
import {
  getInvoicePdf,
  STORED_INVOICE_FIELDS,
} from "../../stripe/webhook/vatInvoice/storage.js";

export async function getInvoiceBySessionId(
  sessionId: string,
  kind: InvoiceKind,
): Promise<{ pdf: Buffer; invoiceNumber: string }> {
  const { invoices } = await $api.client.request<{
    invoices: StoredInvoice[];
  }>(
    gql`
        query GetInvoiceBySessionId($sessionId: uuid!, $kind: String!) {
            invoices: payment_invoices(
            where: {
                session_id: { _eq: $sessionId }
                kind: { _eq: $kind }
            }
            limit: 1
            ) {
            ${STORED_INVOICE_FIELDS}
            }
        }
        `,
    { sessionId, kind },
  );

  const invoice = invoices[0];
  if (!invoice?.fileKey) {
    throw new ServerError({
      status: 404,
      message: `No stored ${kind} found for session ${sessionId}`,
    });
  }

  const pdf = await getInvoicePdf(invoice.fileKey);
  return { pdf, invoiceNumber: invoice.invoiceNumber };
}

export async function getSessionActiveInvoices(
  sessionId: string,
): Promise<Record<InvoiceKind, boolean>> {
  const { invoices } = await $api.client.request<{
    invoices: Pick<StoredInvoice, "kind" | "fileKey">[];
  }>(
    gql`
      query GetActiveInvoices($sessionId: uuid!) {
        invoices: payment_invoices(where: { session_id: { _eq: $sessionId } }) {
          kind
          fileKey: file_key
        }
      }
    `,
    { sessionId },
  );

  return {
    payer_invoice: invoices.some(
      (i) => i.kind === "payer_invoice" && i.fileKey,
    ),
    council_invoice: invoices.some(
      (i) => i.kind === "council_invoice" && i.fileKey,
    ),
  };
}
