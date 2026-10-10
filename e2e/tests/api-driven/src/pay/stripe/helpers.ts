import assert from "node:assert";
import { isDeepStrictEqual } from "node:util";

import { formatStripeMetadata } from "@opensystemslab/planx-core";
import type {
  FeeBreakdown,
  PaymentMetadata,
} from "@opensystemslab/planx-core/types";
import axios from "axios";
import { gql } from "graphql-tag";
import type Stripe from "stripe";

import { poll } from "../../../../shared/poll.js";
import { getStripeTestClient } from "../../../../shared/stripe/client.js";
import { getCheckoutSessionId } from "../../../../shared/stripe/completeCheckoutSession.js";
import { $admin } from "../../client.js";
import {
  createFlow,
  createTeam,
  createUser,
  TEST_EMAIL,
} from "../../globalHelpers.js";
import type { CustomWorld } from "./steps.js";

const TEAM_SLUG = "e2e-stripe";

const DEFAULT_METADATA = {
  flow: "stripe-split-test",
  source: "PlanX",
  paidViaInviteToPay: "false",
};

/**
 * Session passports for each fee shape
 */
const feePassports = {
  // Statutory fees are never VAT-able, only the service charge is
  "a statutory fee": {
    "application.fee.calculated": 258,
    "application.fee.serviceCharge": 40,
    "application.fee.serviceCharge.VAT": 8,
    "application.fee.payable": 306,
    "application.fee.payable.VAT": 8,
  },
  // Discretionary fees (e.g. pre-application advice) carry VAT on the council's fee too
  "a discretionary fee": {
    "application.fee.calculated": 500,
    "application.fee.calculated.VAT": 100,
    "application.fee.serviceCharge": 40,
    "application.fee.serviceCharge.VAT": 8,
    "application.fee.payable": 648,
    "application.fee.payable.VAT": 108,
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
    email: TEST_EMAIL,
  });
  return { flowId, sessionId };
}

/**
 * Create a Checkout Session via the PlanX API
 */
export async function createCheckoutSession({
  flowId,
  sessionId,
  metadata,
}: {
  flowId: string;
  sessionId: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const { data } = await axios.post<{ url: string }>(
    `${process.env.API_URL_EXT}/stripe/checkout-session/${TEAM_SLUG}`,
    {
      sessionId,
      flowId,
      metadata: { ...DEFAULT_METADATA, ...metadata },
    },
  );

  return getCheckoutSessionId(data.url);
}

export interface ValidateSessionResponse {
  message: string;
  changesFound: boolean | null;
  reconciledSessionData: Record<string, unknown>;
}

/**
 * Called when an applicant returns to their saved session via a "Resume" link
 */
export async function validateSession(
  sessionId: string,
): Promise<ValidateSessionResponse> {
  const { data } = await axios.post<ValidateSessionResponse>(
    `${process.env.API_URL_EXT}/validate-session`,
    { payload: { sessionId, email: TEST_EMAIL } },
  );
  return data;
}

export function resolvePayComponentMetadata({
  metadata,
  feeCase,
}: {
  metadata: PaymentMetadata[];
  feeCase: FeeCase;
}): Record<string, string> {
  return formatStripeMetadata({
    metadata,
    userPassport: { data: feePassports[feeCase] },
    paidViaInviteToPay: false,
  });
}

export function getExpectedPaymentMetadata({
  sessionId,
}: {
  sessionId: string;
}): Record<string, string> {
  return {
    ...DEFAULT_METADATA,
    sessionId,
    origin: process.env.API_URL_EXT!,
  };
}

/**
 * The payment transferred to the council's connected account
 * Follow the PaymentIntent -> charge -> transfer -> destination payment thread
 */
async function getDestinationPayment(
  paymentIntentId: string,
): Promise<Stripe.Charge | undefined> {
  const stripe = getStripeTestClient();

  const { latest_charge } = await stripe.paymentIntents.retrieve(
    paymentIntentId,
    { expand: ["latest_charge.transfer"] },
  );
  if (!latest_charge || typeof latest_charge === "string") return;

  const { transfer } = latest_charge;
  if (!transfer || typeof transfer === "string") return;

  const destinationPaymentId =
    typeof transfer.destination_payment === "string"
      ? transfer.destination_payment
      : transfer.destination_payment?.id;
  if (!destinationPaymentId) return;

  return stripe.charges.retrieve(
    destinationPaymentId,
    {},
    { stripeAccount: getConnectedAccountId() },
  );
}

/**
 * Metadata is copied onto the destination payment by the transfer.created webhook
 * We have to poll for this as a simple query will not work here
 */
export async function waitForDestinationPaymentMetadata(
  paymentIntentId: string,
): Promise<Stripe.Metadata> {
  const destinationPayment = await poll({
    fetch: () => getDestinationPayment(paymentIntentId),
    until: (payment) => Boolean(payment?.metadata.sessionId),
    describeTimeout: (payment) => {
      const found = payment
        ? `destination payment ${payment.id} with metadata ${JSON.stringify(payment.metadata)}`
        : "no destination payment";
      return `No metadata on the destination payment for PaymentIntent ${paymentIntentId} (found: ${found})`;
    },
  });
  return destinationPayment!.metadata;
}

export interface StripePaymentStatus {
  stripeStatus: string;
  stripePaymentId: string;
  amount: number;
  feeBreakdown: FeeBreakdown | null;
  metadata: Record<string, string> | null;
}

export async function getStripePaymentStatuses(
  sessionId: string,
): Promise<StripePaymentStatus[]> {
  const { paymentStatuses } = await $admin.client.request<{
    paymentStatuses: StripePaymentStatus[];
  }>(
    gql`
      query GetStripePaymentStatuses($sessionId: uuid!) {
        paymentStatuses: payment_status(
          where: {
            session_id: { _eq: $sessionId }
            stripe_status: { _is_null: false }
          }
        ) {
          stripeStatus: stripe_status
          stripePaymentId: stripe_payment_id
          amount
          feeBreakdown: fee_breakdown
          metadata: stripe_metadata
        }
      }
    `,
    { sessionId },
  );
  return paymentStatuses;
}

/**
 * Payment statuses are written by Stripe webhooks, so arrive after the payment completes
 * We have to poll for these, a simple query will not work
 */
export async function waitForStripePaymentStatus({
  sessionId,
  stripeStatus,
}: {
  sessionId: string;
  stripeStatus: string;
}): Promise<StripePaymentStatus> {
  const findMatch = (rows: StripePaymentStatus[]) =>
    rows.find((row) => row.stripeStatus === stripeStatus);

  const rows = await poll({
    fetch: () => getStripePaymentStatuses(sessionId),
    until: (rows) => Boolean(findMatch(rows)),
    describeTimeout: (rows) => {
      const found = rows.map((row) => row.stripeStatus).join(", ") || "none";
      return `No "${stripeStatus}" payment status for session ${sessionId} (found: ${found})`;
    },
  });
  return findMatch(rows)!;
}

const toAuditTrail = (rows: StripePaymentStatus[]): Record<string, string> =>
  Object.fromEntries(
    rows.map(({ stripeStatus, stripePaymentId }) => [
      stripeStatus,
      stripePaymentId,
    ]),
  );

/**
 * Wait until a session's Stripe payment statuses exactly match the expected audit trail
 *
 * Order is ignored, as Stripe does not guarantee webhook delivery order
 * Docs: https://docs.stripe.com/webhooks#event-ordering
 */
export async function waitForStripeAuditTrail({
  sessionId,
  expected,
}: {
  sessionId: string;
  expected: Record<string, string>;
}): Promise<void> {
  await poll({
    fetch: () => getStripePaymentStatuses(sessionId),
    until: (rows) =>
      // Checking the length catches duplicate rows
      rows.length === Object.keys(expected).length &&
      isDeepStrictEqual(toAuditTrail(rows), expected),
    describeTimeout: (rows) =>
      `Payment status audit trail for session ${sessionId} did not match.\n` +
      `Expected: ${JSON.stringify(expected)}\n` +
      `Found (${rows.length} rows): ${JSON.stringify(toAuditTrail(rows))}`,
  });
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
