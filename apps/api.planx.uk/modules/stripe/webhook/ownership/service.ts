import type { Session } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import type Stripe from "stripe";

import { $api } from "../../../../client/index.js";
import { reportError } from "../../../pay/helpers.js";
import {
  type StripePaymentMetadata,
  stripePaymentMetadataSchema,
} from "../paymentStatus/types.js";

type PassportData = Session["data"]["passport"]["data"];

interface OwnedPaymentIntent {
  metadata: StripePaymentMetadata;
  passportData?: PassportData;
}

/**
 * Check that a PaymentIntent belongs to this environment
 *
 * Non-prod environments share a Stripe sandbox, so every environment receives every event
 * A foreign event is expected traffic, not an error - we return null so the caller can skip it
 */
export async function getOwnedPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  eventLabel: string,
): Promise<OwnedPaymentIntent | null> {
  const { id, metadata } = paymentIntent;

  const parsedMetadata = stripePaymentMetadataSchema.safeParse(metadata);
  if (!parsedMetadata.success) {
    reportError({
      error:
        "Could not handle Stripe event: PaymentIntent metadata is invalid or missing",
      context: {
        paymentIntentId: id,
        eventLabel,
        issues: parsedMetadata.error.issues,
      },
    });
    return null;
  }

  const { sessionId, origin } = parsedMetadata.data;

  if (origin !== process.env.API_URL_EXT) {
    console.info(
      `Ignoring Stripe event for PaymentIntent ${id} (${eventLabel}): created by ${origin}`,
    );
    return null;
  }

  // Local environments share a single origin, so a matching origin alone can't prove the session is ours
  const { session } = await getSession(sessionId);
  if (!session) {
    console.info(
      `Ignoring Stripe event for PaymentIntent ${id} (${eventLabel}): session ${sessionId} not found in this environment`,
    );
    return null;
  }

  return {
    metadata: parsedMetadata.data,
    passportData: session.passportData,
  };
}

interface GetSessionResponse {
  session: Partial<{
    passportData: PassportData;
  }> | null;
}

async function getSession(sessionId: string): Promise<GetSessionResponse> {
  return $api.client.request<GetSessionResponse>(
    gql`
      query GetStripePaymentSession($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          passportData: data(path: "passport.data")
        }
      }
    `,
    { id: sessionId },
  );
}
