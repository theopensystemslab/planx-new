import type { FeeBreakdown } from "@opensystemslab/planx-core/types";
import { fromUnixTime } from "date-fns";
import { gql } from "graphql-request";
import type Stripe from "stripe";

import { $api } from "../../../../client/index.js";
import { reportError } from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import { getFeeLines } from "../../feeLines.js";
import type { PaymentSession } from "../ownership/service.js";
import {
  buildVatInvoiceData,
  getCouncilContactDetails,
  getInvoiceLineItems,
  getPayerContactDetails,
  isInvoiceRequired,
  sumLineItems,
} from "./data.js";
import { generateVatInvoicePdf } from "./pdf.js";
import { getCouncilInvoiceDetails, PLANX_SELLER } from "./seller.js";
import type { InvoiceKind } from "./storage.js";
import { reserveInvoice, storeInvoicePdf } from "./storage.js";
import type { VatInvoiceData } from "./types.js";

const INVOICE_KINDS: InvoiceKind[] = ["payer_invoice", "council_invoice"];

/**
 * The Checkout Session which created a PaymentIntent
 */
export const getCheckoutSession = async (
  paymentIntentId: string,
): Promise<Stripe.Checkout.Session | null> => {
  const {
    data: [checkoutSession],
  } = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });

  return checkoutSession ?? null;
};

/**
 * The fee breakdown recorded when the Checkout Session was created (see recordInitiatedPayment())
 */
export const getChargedFeeBreakdown = async (
  sessionId: string,
  checkoutSessionId: string,
): Promise<FeeBreakdown | null> => {
  const { paymentStatus } = await $api.client.request<{
    paymentStatus: { feeBreakdown: FeeBreakdown | null }[];
  }>(
    gql`
      query GetChargedFeeBreakdown(
        $sessionId: uuid!
        $checkoutSessionId: String!
      ) {
        paymentStatus: payment_status(
          where: {
            session_id: { _eq: $sessionId }
            stripe_payment_id: { _eq: $checkoutSessionId }
            stripe_status: { _eq: initiated }
          }
          limit: 1
        ) {
          feeBreakdown: fee_breakdown
        }
      }
    `,
    { sessionId, checkoutSessionId },
  );

  return paymentStatus[0]?.feeBreakdown ?? null;
};

/**
 * When the payment succeeded, as recorded from the Stripe webhook
 *
 * For delayed payment methods (e.g. Bacs Direct Debit) this is days after the PaymentIntent was created
 * Falls back to when the PaymentIntent was created, which should not happen as this runs after the row is recorded
 */
export const getSucceededAt = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<Date> => {
  const { paymentStatus } = await $api.client.request<{
    paymentStatus: { createdAt: string }[];
  }>(
    gql`
      query GetPaymentSucceededAt($paymentIntentId: String!) {
        paymentStatus: payment_status(
          where: {
            stripe_payment_id: { _eq: $paymentIntentId }
            stripe_status: { _eq: succeeded }
          }
          order_by: { created_at: asc }
          limit: 1
        ) {
          createdAt: created_at
        }
      }
    `,
    { paymentIntentId: paymentIntent.id },
  );

  const createdAt = paymentStatus[0]?.createdAt;
  return createdAt ? new Date(createdAt) : fromUnixTime(paymentIntent.created);
};

/**
 * Generate and store the invoices for a successful Stripe payment
 *  - payer_invoice: the council bills the payer for every line, when there's any VAT or a service charge
 *  - council_invoice: OSL bills the council for the service charge, when there is one
 *
 * Called from the payment_status event trigger - throws errors to make Hasura retry the event
 * Safe to retry - a retry reuses each invoice's number, and skips any invoice whose PDF has already been stored
 */
export async function createInvoices(
  paymentIntent: Stripe.PaymentIntent,
  recorded: PaymentSession,
): Promise<void> {
  const context = {
    paymentIntentId: paymentIntent.id,
    sessionId: recorded.sessionId,
  };

  const checkoutSession = await getCheckoutSession(paymentIntent.id);
  if (!checkoutSession) {
    return reportError({
      error:
        "Could not create invoices: no Checkout Session found for the PaymentIntent",
      context,
    });
  }

  const customerEmail = checkoutSession.customer_details?.email;
  if (!customerEmail) {
    return reportError({
      error:
        "Could not create invoices: no customer email found on the Checkout Session",
      context,
    });
  }

  const feeBreakdown = await getChargedFeeBreakdown(
    recorded.sessionId,
    checkoutSession.id,
  );

  if (!feeBreakdown) {
    return reportError({
      error:
        "Could not create invoices: no fee breakdown recorded for the Checkout Session",
      context: { ...context, checkoutSessionId: checkoutSession.id },
    });
  }

  // TODO - double check this behaviour, is it fine to just reject if the application had a `setFee` ?
  if (feeBreakdown.amount.paymentProcessing > 0) {
    return reportError({
      error:
        "Could not create invoices: session has a legacy payment processing fee",
      context,
    });
  }

  const feeLines = getFeeLines(feeBreakdown);
  const hasInvalidVATSplit = feeLines?.some(
    ({ net, vat }) => net < 0 || vat < 0,
  );
  if (!feeLines || hasInvalidVATSplit) {
    return reportError({
      error: "Could not create invoices: fee breakdown is inconsistent",
      context,
    });
  }

  const council = await getCouncilInvoiceDetails(recorded.teamSlug);
  if (!council.hasInvoiceDetails) {
    reportError({
      error:
        "Council has no invoice details configured - invoicing under the team name",
      context: { ...context, teamSlug: recorded.teamSlug },
    });
  }

  const issuedAt = await getSucceededAt(paymentIntent);

  const parties: Record<
    InvoiceKind,
    Pick<VatInvoiceData, "seller" | "branding" | "customer">
  > = {
    payer_invoice: {
      seller: council.seller,
      branding: council.branding,
      customer: getPayerContactDetails(
        customerEmail,
        checkoutSession.customer_details,
      ),
    },
    council_invoice: {
      seller: PLANX_SELLER,
      branding: null,
      customer: getCouncilContactDetails(council.seller),
    },
  };

  for (const kind of INVOICE_KINDS) {
    if (!isInvoiceRequired(feeLines, kind)) continue;

    const lineItems = getInvoiceLineItems(feeLines, kind);

    // Allocates the invoice number - or returns the invoice recorded by a previous attempt, with its number
    const reserved = await reserveInvoice({
      kind,
      stripePaymentIntentId: paymentIntent.id,
      sessionId: recorded.sessionId,
      flowId: recorded.flowId,
      teamId: council.teamId,
      issuedAt,
      ...sumLineItems(lineItems),
    });

    // PDF already stored by a previous attempt
    if (reserved.fileKey) continue;

    const invoice = buildVatInvoiceData({
      kind,
      invoiceNumber: reserved.invoiceNumber,
      paymentIntent,
      recorded,
      issuedAt,
      ...parties[kind],
      lineItems,
    });

    const pdf = await generateVatInvoicePdf(invoice);

    await storeInvoicePdf(reserved, pdf);
  }
}
