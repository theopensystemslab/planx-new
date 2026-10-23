import type { FeeBreakdown } from "@opensystemslab/planx-core/types";
import { format } from "date-fns";
import { gql } from "graphql-request";
import escape from "lodash/escape.js";
import type Stripe from "stripe";

import { $api } from "../../../../client/index.js";
import { sendEmail } from "../../../../lib/resend/index.js";
import { reportError } from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import { getFeeLines } from "../../feeLines.js";
import { formatPence } from "../../helpers.js";
import type { OwnedPaymentIntent } from "../ownership/service.js";
import { buildVatInvoiceData, groupFeeLinesByIssuer } from "./data.js";
import { generateVatInvoicePdf } from "./pdf.js";
import { getCouncilInvoiceDetails, PLANX_SELLER } from "./seller.js";
import type { VatInvoiceBranding, VatInvoiceData } from "./types.js";

const DEFAULT_PRIMARY_COLOUR = "#0010A4";

export const buildCouncilEmailHeader = (
  councilName: string,
  branding: VatInvoiceBranding | null,
): string =>
  branding?.logo
    ? `<img src="${escape(branding.logo)}" alt="${escape(councilName)}" height="40" />`
    : escape(councilName);

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
 * Email VAT invoices to the payer of a successful Stripe payment
 *
 * A payment results in up to two invoices, sent as separate emails
 *  - council: for the portion transferred to the council, with the council's branding
 *  - planx: for the PlanX service charge, only if one was charged
 *
 * Called from the payment_status event trigger - throws errors to make Hasura retry the event
 * Uses idempotency keys to prevent duplicate emails being sent
 */
export async function sendVatInvoices(
  paymentIntent: Stripe.PaymentIntent,
  recorded: OwnedPaymentIntent,
): Promise<void> {
  const context = {
    paymentIntentId: paymentIntent.id,
    sessionId: recorded.sessionId,
  };

  const checkoutSession = await getCheckoutSession(paymentIntent.id);
  if (!checkoutSession) {
    return reportError({
      error:
        "Could not send VAT invoices: no Checkout Session found for the PaymentIntent",
      context,
    });
  }

  const customerEmail = checkoutSession.customer_details?.email;
  if (!customerEmail) {
    return reportError({
      error:
        "Could not send VAT invoices: no customer email found on the Checkout Session",
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
        "Could not send VAT invoices: no fee breakdown recorded for the Checkout Session",
      context: { ...context, checkoutSessionId: checkoutSession.id },
    });
  }

  // TODO - double check this behaviour, is it fine to just reject if the application had a `setFee` ?
  if (feeBreakdown.amount.paymentProcessing > 0) {
    return reportError({
      error:
        "Could not send VAT invoices: session has a legacy payment processing fee",
      context,
    });
  }

  const feeLines = getFeeLines(feeBreakdown);
  const hasInvalidVATSplit = feeLines?.some(
    ({ net, vat }) => net < 0 || vat < 0,
  );
  if (!feeLines || hasInvalidVATSplit) {
    return reportError({
      error: "Could not send VAT invoices: fee breakdown is inconsistent",
      context,
    });
  }

  const lineItems = groupFeeLinesByIssuer(feeLines);

  const invoiceArgs = { paymentIntent, recorded, customerEmail };

  if (lineItems.council.length) {
    const councilDetails = await getCouncilInvoiceDetails(recorded.teamSlug);
    if (councilDetails) {
      const councilInvoice = buildVatInvoiceData({
        ...invoiceArgs,
        ...councilDetails,
        issuer: "council",
        lineItems: lineItems.council,
      });

      await sendVatInvoiceEmail(councilInvoice);
    } else {
      reportError({
        error:
          "Could not send council VAT invoice: team has no invoice details configured",
        context: { ...context, teamSlug: recorded.teamSlug },
      });
    }
  }

  if (lineItems.planx.length) {
    const planXInvoice = buildVatInvoiceData({
      ...invoiceArgs,
      issuer: "planx",
      seller: PLANX_SELLER,
      branding: null,
      lineItems: lineItems.planx,
    });

    await sendVatInvoiceEmail(planXInvoice);
  }
}

async function sendVatInvoiceEmail(invoice: VatInvoiceData): Promise<void> {
  const { issuer, invoiceNumber, customerEmail } = invoice;
  const pdf = await generateVatInvoicePdf(invoice);

  const variables = {
    serviceName: invoice.flowName,
    invoiceNumber,
    amount: formatPence(invoice.totals.total),
    paymentDate: format(invoice.issuedAt, "d MMMM yyyy"),
  };

  const options = {
    idempotencyKey: `vat-invoice-${issuer}-${invoiceNumber}`,
    attachments: [
      {
        filename: `invoice-${issuer}-${invoiceNumber}.pdf`,
        content: pdf,
      },
    ],
  };

  if (issuer === "council") {
    await sendEmail(
      "vat-invoice-council",
      customerEmail,
      {
        ...variables,
        councilName: invoice.seller.name,
        header: buildCouncilEmailHeader(invoice.seller.name, invoice.branding),
        primaryColour:
          invoice.branding?.primaryColour ?? DEFAULT_PRIMARY_COLOUR,
      },
      options,
    );
  } else {
    await sendEmail("vat-invoice-planx", customerEmail, variables, options);
  }
}
