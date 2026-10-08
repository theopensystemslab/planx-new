import type { Session } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import type Stripe from "stripe";

import { $api } from "../../../../client/index.js";
import { reportError } from "../../../pay/helpers.js";
import { stripePaymentMetadataSchema } from "../paymentStatus/types.js";

type PassportData = Session["data"]["passport"]["data"];

export interface OwnedPaymentIntent {
  sessionId: string;
  flowId: string;
  flowName: string;
  teamSlug: string;
  teamName: string;
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

  // Should not happen - type narrowing
  if (!session.flow) {
    throw new Error(
      `Could not find flow ${session.flowId} for session ${sessionId} (PaymentIntent ${id})`,
    );
  }

  return {
    sessionId,
    flowId: session.flowId,
    flowName: session.flow.name,
    teamSlug: session.flow.team.slug,
    teamName: session.flow.team.name,
    passportData: session.passportData,
  };
}

interface GetSessionResponse {
  session: {
    flowId: string;
    flow: { name: string; team: { slug: string; name: string } } | null;
    passportData?: PassportData;
  } | null;
}

async function getSession(sessionId: string): Promise<GetSessionResponse> {
  return $api.client.request<GetSessionResponse>(
    gql`
      query GetStripePaymentSession($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          flowId: flow_id
          flow {
            name
            team {
              slug
              name
            }
          }
          passportData: data(path: "passport.data")
        }
      }
    `,
    { id: sessionId },
  );
}
