import assert from "node:assert";

import axios from "axios";
import { gql } from "graphql-tag";
import type Stripe from "stripe";

import {
  completeStripeCheckoutSession,
  getCheckoutSessionId,
} from "../../../../shared/stripe/completeCheckoutSession.js";
import { $admin } from "../../client.js";
import { createFlow, createTeam, createUser } from "../../globalHelpers.js";
import type { CustomWorld } from "./steps.js";

const TEAM_SLUG = "e2e-stripe";

/**
 * Session passports for each fee shape
 */
const feePassports = {
  "a standard fee": {
    "application.fee.calculated": 258,
    "application.fee.serviceCharge": 40,
    "application.fee.serviceCharge.VAT": 8,
    "application.fee.payable": 306,
    "application.fee.payable.VAT": 8,
  },
  "a Fast Track fee": {
    "application.fee.calculated": 258,
    "application.fee.fastTrack": 150,
    "application.fee.fastTrack.VAT": 30,
    "application.fee.serviceCharge": 40,
    "application.fee.serviceCharge.VAT": 8,
    "application.fee.payable": 486,
    "application.fee.payable.VAT": 38,
  },
  "a reduced fee": {
    "application.fee.calculated": 258,
    "application.fee.reduction.alternative": ["true"],
    "application.fee.serviceCharge": 40,
    "application.fee.serviceCharge.VAT": 8,
    "application.fee.payable": 177,
    "application.fee.payable.VAT": 8,
  },
};

export type FeeCase = keyof typeof feePassports;

export function toFeeCase(fee: string): FeeCase {
  assert(fee in feePassports, `No fee passport for "${fee}"`);
  return fee as FeeCase;
}

export function getConnectedAccountId(): string {
  const accountId = process.env.STRIPE_CONNECT_ACCOUNT_ID_E2E;
  assert(accountId, "STRIPE_CONNECT_ACCOUNT_ID_E2E must be set");
  return accountId;
}

export async function setupTeam() {
  const teamId = await createTeam({
    name: "E2E Stripe Test Team",
    slug: TEAM_SLUG,
  });
  const userId = await createUser();
  return { teamId, userId };
}

export async function connectStripeAccount(teamId: number) {
  await $admin.client.request(
    gql`
      mutation SetupStripeE2E($teamId: Int!, $stripeAccountId: String!) {
        update_team_integrations(
          where: { team_id: { _eq: $teamId } }
          _set: { staging_stripe_account_id: $stripeAccountId }
        ) {
          affected_rows
        }
        update_team_settings(
          where: { team_id: { _eq: $teamId } }
          _set: { payment_provider: "stripe" }
        ) {
          affected_rows
        }
      }
    `,
    { teamId, stripeAccountId: getConnectedAccountId() },
  );
}

export async function buildSessionWithFees({
  teamId,
  userId,
  feeCase,
}: {
  teamId: number;
  userId: number;
  feeCase: FeeCase;
}) {
  const flowId = await createFlow({
    teamId,
    userId,
    slug: "stripe-split-test",
    name: "Stripe split test",
  });
  const sessionId = await $admin.session.create({
    flowId,
    data: { breadcrumbs: {}, passport: { data: feePassports[feeCase] } },
  });
  return { flowId, sessionId };
}

/**
 * Create a Checkout Session via the PlanX API, then complete it without a browser
 */
export async function payViaStripeCheckout({
  flowId,
  sessionId,
  feeCase,
}: {
  flowId: string;
  sessionId: string;
  feeCase: FeeCase;
}): Promise<Stripe.PaymentIntent> {
  const { data } = await axios.post<{ url: string }>(
    `${process.env.API_URL_EXT}/stripe/checkout-session/${TEAM_SLUG}`,
    {
      sessionId,
      flowId,
      amount: feePassports[feeCase]["application.fee.payable"] * 100,
      returnURL: `${process.env.EDITOR_URL_EXT}/${TEAM_SLUG}/stripe-split-test/published`,
      metadata: {
        flow: "stripe-split-test",
        source: "PlanX",
        paidViaInviteToPay: "false",
      },
    },
  );

  return completeStripeCheckoutSession(getCheckoutSessionId(data.url));
}

export async function cleanup({
  teamId,
  userId,
  flowId,
  sessionId,
}: CustomWorld) {
  if (sessionId) await $admin.session._destroy(sessionId);
  if (flowId) await $admin.flow._destroy(flowId);
  if (userId) await $admin.user._destroy(userId);
  if (teamId) await $admin.team._destroy(teamId);
}
