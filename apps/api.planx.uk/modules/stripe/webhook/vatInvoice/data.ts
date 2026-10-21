import type Stripe from "stripe";

import type { FeeLine } from "../../feeLines.js";
import type { RecordedPaymentIntent } from "../paymentStatus/service.js";
import type {
  VatInvoiceBranding,
  VatInvoiceData,
  VatInvoiceIssuer,
  VatInvoiceLineItem,
  VatInvoiceSeller,
} from "./types.js";

/**
 * Split fee lines between the council and PlanX invoices, dropping any zero-value lines
 */
export const groupFeeLinesByIssuer = (
  feeLines: FeeLine[],
): Record<VatInvoiceIssuer, VatInvoiceLineItem[]> => {
  const linesFor = (issuer: VatInvoiceIssuer) =>
    feeLines
      .filter(({ payee, total }) => payee === issuer && total > 0)
      .map(({ payee: _payee, ...lineItem }) => lineItem);

  return { council: linesFor("council"), planx: linesFor("planx") };
};

export const sumLineItems = (lineItems: VatInvoiceLineItem[]) =>
  lineItems.reduce(
    (acc, { net, vat, total }) => ({
      net: acc.net + net,
      vat: acc.vat + vat,
      total: acc.total + total,
    }),
    { net: 0, vat: 0, total: 0 },
  );

interface BuildVatInvoiceDataArgs {
  issuer: VatInvoiceIssuer;
  paymentIntent: Stripe.PaymentIntent;
  recorded: RecordedPaymentIntent;
  customerEmail: string;
  seller: VatInvoiceSeller;
  branding: VatInvoiceBranding | null;
  lineItems: VatInvoiceLineItem[];
}

export const buildVatInvoiceData = ({
  issuer,
  paymentIntent,
  recorded,
  customerEmail,
  seller,
  branding,
  lineItems,
}: BuildVatInvoiceDataArgs): VatInvoiceData => ({
  issuer,
  invoiceNumber: paymentIntent.id,
  // Stripe timestamps are in seconds
  issuedAt: new Date(paymentIntent.created * 1000),
  customerEmail,
  sessionId: recorded.sessionId,
  flowId: recorded.flowId,
  flowName: recorded.flowName,
  teamSlug: recorded.teamSlug,
  teamName: recorded.teamName,
  seller,
  branding,
  lineItems,
  totals: sumLineItems(lineItems),
});
