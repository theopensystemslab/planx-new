import type Stripe from "stripe";

import type { FeeLine } from "../../feeLines.js";
import type { PaymentSession } from "../ownership/service.js";
import type { InvoiceKind } from "./storage.js";
import type {
  VatInvoiceBranding,
  VatInvoiceContactDetails,
  VatInvoiceData,
  VatInvoiceLineItem,
  VatInvoiceSeller,
  VatInvoiceVatSummary,
} from "./types.js";

/**
 * VAT rate as a whole percentage, derived from a line's net and VAT amounts
 */
export const getVatRate = ({ net, vat }: Pick<FeeLine, "net" | "vat">) =>
  net > 0 ? Math.round((vat / net) * 100) : 0;

/**
 * Whether a payment needs each kind of invoice
 *  - payer_invoice: when there's VAT on any fee, or a service charge
 *  - council_invoice: when there's a service charge
 */
export const isInvoiceRequired = (feeLines: FeeLine[], kind: InvoiceKind) =>
  feeLines.some(
    ({ payee, vat, total }) =>
      total > 0 && (payee === "planx" || (kind === "payer_invoice" && vat > 0)),
  );

/**
 * The fee lines which appear on each kind of invoice, dropping any zero-value lines
 *  - payer_invoice: every line of the payment
 *  - council_invoice: only the service charge, which OSL keeps
 */
export const getInvoiceLineItems = (
  feeLines: FeeLine[],
  kind: InvoiceKind,
): VatInvoiceLineItem[] =>
  feeLines
    .filter(
      ({ payee, total }) =>
        total > 0 && (kind === "payer_invoice" || payee === "planx"),
    )
    .map(({ payee: _payee, ...lineItem }) => ({
      ...lineItem,
      vatRate: getVatRate(lineItem),
    }));

export const sumLineItems = (lineItems: VatInvoiceLineItem[]) =>
  lineItems.reduce(
    (acc, { net, vat, total }) => ({
      net: acc.net + net,
      vat: acc.vat + vat,
      total: acc.total + total,
    }),
    { net: 0, vat: 0, total: 0 },
  );

/**
 * Net and VAT totals for each VAT rate on the invoice, highest rate first
 */
export const summariseVat = (
  lineItems: VatInvoiceLineItem[],
): VatInvoiceVatSummary[] => {
  const byRate = new Map<number, VatInvoiceVatSummary>();

  for (const { vatRate, net, vat } of lineItems) {
    const summary = byRate.get(vatRate) ?? { rate: vatRate, net: 0, vat: 0 };
    byRate.set(vatRate, {
      ...summary,
      net: summary.net + net,
      vat: summary.vat + vat,
    });
  }

  return [...byRate.values()].sort((a, b) => b.rate - a.rate);
};

/**
 * Contact details for the payer, billed on the payer_invoice
 * Name and address are only present if they were entered on Stripe Checkout
 */
export const getPayerContactDetails = (
  email: string,
  customerDetails: Stripe.Checkout.Session.CustomerDetails | null,
): VatInvoiceContactDetails => {
  const address = customerDetails?.address;

  return {
    email,
    name: customerDetails?.name || null,
    addressLines: [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
    ].filter((line): line is string => Boolean(line)),
  };
};

/**
 * Contact details for the council, billed for the service charge on the council_invoice
 * Uses the details the council has configured for invoices
 */
export const getCouncilContactDetails = ({
  name,
  addressLines,
  email,
}: VatInvoiceSeller): VatInvoiceContactDetails => ({
  name,
  addressLines,
  email,
});

interface BuildVatInvoiceDataArgs {
  kind: InvoiceKind;
  invoiceNumber: string;
  paymentIntent: Stripe.PaymentIntent;
  recorded: PaymentSession;
  issuedAt: Date;
  customer: VatInvoiceContactDetails;
  seller: VatInvoiceSeller;
  branding: VatInvoiceBranding | null;
  lineItems: VatInvoiceLineItem[];
}

export const buildVatInvoiceData = ({
  kind,
  invoiceNumber,
  paymentIntent,
  recorded,
  issuedAt,
  customer,
  seller,
  branding,
  lineItems,
}: BuildVatInvoiceDataArgs): VatInvoiceData => ({
  kind,
  isTest: !paymentIntent.livemode,
  invoiceNumber,
  issuedAt,
  customer,
  sessionId: recorded.sessionId,
  paymentId: paymentIntent.id,
  flowId: recorded.flowId,
  flowName: recorded.flowName,
  teamSlug: recorded.teamSlug,
  teamName: recorded.teamName,
  seller,
  branding,
  lineItems,
  totals: sumLineItems(lineItems),
  vatSummary: summariseVat(lineItems),
});
