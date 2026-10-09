import { format } from "date-fns";
import type Stripe from "stripe";

import { sendEmail } from "../../../../lib/resend/index.js";
import { reportError } from "../../../pay/helpers.js";
import { stripe } from "../../client.js";
import { getFeeLines } from "../../feeLines.js";
import type { RecordedPaymentIntent } from "../paymentStatus/service.js";
import {
  buildVatInvoiceData,
  groupFeeLinesByIssuer,
  sumLineItems,
} from "./data.js";
import { generateVatInvoicePdf } from "./pdf.js";
import { getCouncilInvoiceDetails, PLANX_SELLER } from "./seller.js";
import type { VatInvoiceData } from "./types.js";

/**
 * Feature flag whilst VAT invoices are in development
 */
export const isVatInvoiceEnabled = () =>
  process.env.STRIPE_VAT_INVOICES_ENABLED === "true";

const formatPence = (pence: number) =>
  (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP" });

/**
 * The payer's email is collected by Stripe Checkout, not stored on the PaymentIntent
 *
 * TODO - in the case of ITP the payer can be different to the applicant. Do we need to send invoices to both?
 */
export const getCheckoutCustomerEmail = async (
  paymentIntentId: string,
): Promise<string | null> => {
  const {
    data: [checkoutSession],
  } = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });

  return checkoutSession?.customer_details?.email ?? null;
};

/**
 * Email VAT invoices to the payer of a successful Stripe payment
 *
 * A payment results in up to two invoices, sent as separate emails
 *  - council: for the portion transferred to the council, with the council's branding
 *  - planx: for the PlanX service charge, only if one was charged
 *
 * Throws errors to make Stripe redeliver the event
 * Uses idempotency keys to prevent duplicate emails being sent
 */
export async function sendVatInvoices(
  paymentIntent: Stripe.PaymentIntent,
  recorded: RecordedPaymentIntent,
): Promise<void> {
  if (!isVatInvoiceEnabled()) return;

  const context = {
    paymentIntentId: paymentIntent.id,
    sessionId: recorded.sessionId,
  };

  const { feeBreakdown } = recorded;
  if (!feeBreakdown) {
    return reportError({
      error: "Could not send VAT invoices: no fee breakdown for the session",
      context,
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

  const customerEmail = await getCheckoutCustomerEmail(paymentIntent.id);
  if (!customerEmail) {
    return reportError({
      error:
        "Could not send VAT invoices: no customer email found on the Checkout Session",
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

  // The fee breakdown must match what Stripe actually charged and split (see calculateStripeSplit())
  const expected = {
    amount: sumLineItems([...lineItems.council, ...lineItems.planx]).total,
    applicationFeeAmount: sumLineItems(lineItems.planx).total,
  };

  const charged = {
    amount: paymentIntent.amount,
    applicationFeeAmount: paymentIntent.application_fee_amount ?? 0,
  };

  if (
    expected.amount !== charged.amount ||
    expected.applicationFeeAmount !== charged.applicationFeeAmount
  ) {
    return reportError({
      error:
        "Could not send VAT invoices: fee breakdown does not match the amounts charged by Stripe",
      context: { ...context, expected, charged },
    });
  }

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
        logo: invoice.branding?.logo ?? "",
        primaryColour: invoice.branding?.primaryColour ?? "",
      },
      options,
    );
  } else {
    await sendEmail("vat-invoice-planx", customerEmail, variables, options);
  }
}
