import type { SiteAddress } from "@opensystemslab/planx-core/types";
import { format } from "date-fns";
import { gql } from "graphql-request";
import type { Attachment } from "resend";
import type Stripe from "stripe";

import { $api } from "../../../../client/index.js";
import {
  getCouncilFromAddress,
  sendEmail,
} from "../../../../lib/resend/index.js";
import { reportError } from "../../../pay/helpers.js";
import { formatPence } from "../../helpers.js";
import type { PaymentSession } from "../ownership/service.js";
import { getPaymentMethodType } from "../paymentStatus/service.js";
import { getCheckoutSession, getSucceededAt } from "../vatInvoice/service.js";
import type { StoredInvoice } from "../vatInvoice/storage.js";
import { getInvoicePdf, getStoredInvoices } from "../vatInvoice/storage.js";

interface CouncilEmailDetails {
  /** Reply-to address for emails to the payer */
  helpEmail: string | null;
  /** Where the council receives VAT documents */
  invoiceEmail: string | null;
  logo: string | null;
  primaryColour: string | null;
}

export async function getCouncilEmailDetails(
  teamSlug: string,
): Promise<CouncilEmailDetails> {
  const {
    teams: [team],
  } = await $api.client.request<{
    teams: {
      teamSettings: { helpEmail: string | null } | null;
      invoiceDetails: { emailAddress: string | null } | null;
      theme: { logo: string | null; primaryColour: string | null } | null;
    }[];
  }>(
    gql`
      query GetCouncilEmailDetails($teamSlug: String!) {
        teams(where: { slug: { _eq: $teamSlug } }) {
          teamSettings: team_settings {
            helpEmail: help_email
          }
          invoiceDetails: invoice_details {
            emailAddress: email_address
          }
          theme {
            logo
            primaryColour: primary_colour
          }
        }
      }
    `,
    { teamSlug },
  );

  if (!team) throw new Error(`Team ${teamSlug} not found`);

  return {
    helpEmail: team.teamSettings?.helpEmail || null,
    invoiceEmail: team.invoiceDetails?.emailAddress || null,
    logo: team.theme?.logo || null,
    primaryColour: team.theme?.primaryColour || null,
  };
}

const PAYMENT_METHOD_LABELS: Partial<
  Record<Stripe.PaymentMethod.Type, string>
> = {
  card: "Card",
  pay_by_bank: "Pay by bank",
  bacs_debit: "Bacs Direct Debit",
};

export const formatPaymentMethod = (
  type: Stripe.PaymentMethod.Type | null,
): string => {
  if (!type) return "Unknown";
  return PAYMENT_METHOD_LABELS[type] ?? type.replaceAll("_", " ");
};

export const formatSiteAddress = (
  passportData: PaymentSession["passportData"],
): string => {
  const address = passportData?._address as SiteAddress | undefined;
  return (
    address?.single_line_address || address?.title || "Address not submitted"
  );
};

const toAttachment = async ({
  invoiceNumber,
  fileKey,
}: StoredInvoice): Promise<Attachment> => {
  // Should not happen - createInvoices() stores every PDF before this runs
  if (!fileKey) throw new Error(`Invoice ${invoiceNumber} has no PDF stored`);

  return {
    filename: `${invoiceNumber}.pdf`,
    content: await getInvoicePdf(fileKey),
  };
};

/**
 * Email the payer and the council once a Stripe payment has succeeded (for Bacs, once it has cleared)
 *  - payer: payment confirmation, with their VAT receipt attached if there is one
 *    Sent from the Local Planning Services domain in the council's name, replying to the council
 *  - council: payment confirmation, with all of the payment's VAT documents attached
 *
 * Runs after createInvoices(), so the documents are already stored
 * Throws errors to make Hasura retry the event - idempotency keys stop a retry sending duplicates
 */
export async function sendPaymentConfirmationEmails(
  paymentIntent: Stripe.PaymentIntent,
  recorded: PaymentSession,
): Promise<void> {
  const context = {
    paymentIntentId: paymentIntent.id,
    sessionId: recorded.sessionId,
  };

  const [checkoutSession, council, invoices, succeededAt] = await Promise.all([
    getCheckoutSession(paymentIntent.id),
    getCouncilEmailDetails(recorded.teamSlug),
    getStoredInvoices(paymentIntent.id),
    getSucceededAt(paymentIntent),
  ]);

  const variables = {
    serviceName: recorded.flowName,
    councilName: recorded.teamName,
    sessionId: recorded.sessionId,
    paymentReference: paymentIntent.id,
    amount: formatPence(paymentIntent.amount),
    paymentDate: format(succeededAt, "d MMMM yyyy"),
  };

  const receipt = invoices.find(({ kind }) => kind === "payer_invoice");
  const payerEmail = checkoutSession?.customer_details?.email;

  if (!payerEmail) {
    reportError({
      error:
        "Could not send payment confirmation: no payer email found on the Checkout Session",
      context,
    });
  } else {
    await sendEmail(
      "payment-confirmed-payer",
      payerEmail,
      {
        ...variables,
        councilLogo: council.logo ?? "",
        councilPrimaryColour: council.primaryColour ?? "",
      },
      {
        idempotencyKey: `payment-confirmed-payer-${paymentIntent.id}`,
        from: getCouncilFromAddress(recorded.teamName),
        replyTo: council.helpEmail ?? undefined,
        attachments: receipt ? [await toAttachment(receipt)] : undefined,
      },
    );
  }

  if (!council.invoiceEmail) {
    return reportError({
      error:
        "Could not send payment confirmation to the council: no invoice email address configured",
      context: { ...context, teamSlug: recorded.teamSlug },
    });
  }

  const paymentMethod = await getPaymentMethodType(paymentIntent);

  await sendEmail(
    "payment-confirmed-council",
    council.invoiceEmail,
    {
      ...variables,
      address: formatSiteAddress(recorded.passportData),
      paymentMethod: formatPaymentMethod(paymentMethod),
    },
    {
      idempotencyKey: `payment-confirmed-council-${paymentIntent.id}`,
      attachments: invoices.length
        ? await Promise.all(invoices.map(toAttachment))
        : undefined,
    },
  );
}
