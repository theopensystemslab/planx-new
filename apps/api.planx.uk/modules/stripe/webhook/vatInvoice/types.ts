import type { FeeLine } from "../../feeLines.js";
import type { InvoiceKind } from "./storage.js";

/**
 * All monetary values are in pence
 */
export type VatInvoiceLineItem = Omit<FeeLine, "payee"> & {
  /** Whole percentage, e.g. 20 */
  vatRate: number;
};

export interface VatInvoiceSeller {
  name: string;
  addressLines: string[];
  vatNumber: string | null;
  companyRegistration: string | null;
  email: string | null;
}

export interface VatInvoiceBranding {
  logo: string | null;
  primaryColour: string | null;
}

/**
 * Who the invoice is billed to - the payer (payer_invoice), or the council (council_invoice)
 */
export interface VatInvoiceContactDetails {
  email: string | null;
  name: string | null;
  addressLines: string[];
}

export interface VatInvoiceVatSummary {
  rate: number;
  net: number;
  vat: number;
}

export interface VatInvoiceData {
  kind: InvoiceKind;
  /** Paid in Stripe test mode (e.g. on staging) - marked so it can't be mistaken for a real invoice */
  isTest: boolean;
  invoiceNumber: string;
  issuedAt: Date;
  customer: VatInvoiceContactDetails;
  sessionId: string;
  paymentId: string; // stripe payment intent ID
  flowId: string;
  flowName: string;
  teamSlug: string;
  teamName: string;
  seller: VatInvoiceSeller;
  branding: VatInvoiceBranding | null;
  lineItems: VatInvoiceLineItem[];
  totals: Omit<VatInvoiceLineItem, "description" | "vatRate">;
  vatSummary: VatInvoiceVatSummary[];
}
