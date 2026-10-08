import type { EmailTemplate } from "./index.js";

type VatInvoiceVariables = {
  serviceName: string;
  invoiceNumber: string;
  amount: string;
  paymentDate: string;
};

/**
 * Sent to the payer of a successful Stripe payment, with the council's VAT invoice attached as a PDF
 * Branded with the council's theme
 */
export type VatInvoiceCouncilTemplate = EmailTemplate<
  "vat-invoice-council",
  VatInvoiceVariables & {
    councilName: string;
    logo: string;
    primaryColour: string;
  }
>;

/**
 * Sent to the payer of a successful Stripe payment, with PlanX's VAT invoice (service charge) attached as a PDF
 */
export type VatInvoicePlanXTemplate = EmailTemplate<
  "vat-invoice-planx",
  VatInvoiceVariables
>;
