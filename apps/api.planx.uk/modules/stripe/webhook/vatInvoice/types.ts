import type { FeeLine, FeePayee } from "../../feeLines.js";

/**
 * Each payment has a council portion and a PlanX portion, so we invoice separately
 */
export type VatInvoiceIssuer = FeePayee;

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
  primaryColour: string;
}

/**
 * Who the invoice is billed to - the payer, or the council
 */
export interface VatInvoiceCustomer {
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
  issuer: VatInvoiceIssuer;
  /** The Stripe PaymentIntent ID */
  invoiceNumber: string;
  issuedAt: Date;
  customerEmail: string;
  sessionId: string;
  flowId: string;
  flowName: string;
  teamSlug: string;
  teamName: string;
  seller: VatInvoiceSeller;
  branding: VatInvoiceBranding | null;
  lineItems: VatInvoiceLineItem[];
  totals: Omit<VatInvoiceLineItem, "description" | "vatRate">;
}
