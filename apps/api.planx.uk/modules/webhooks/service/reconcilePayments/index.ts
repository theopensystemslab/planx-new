import axios from "axios";
import { subHours } from "date-fns";
import { gql } from "graphql-request";

import { $api } from "../../../../client/index.js";
import { getFormattedEnvironment } from "../../../../helpers.js";
import { sendSlackMessage } from "../../../slack/utils.js";
import type { PaymentCandidate, ReconcilePaymentsResponse } from "./types.js";

/**
 * How far back to look for payments which never resolved
 * Payments older than this are assumed to have already been investigated
 */
export const LOOKBACK_HOURS = 24;

/**
 * Payments more recent than this are ignored, so we don't interfere with one
 * still being processed by the frontend (as per GovPay recommendations)
 */
export const GRACE_PERIOD_HOURS = 3;

/**
 * Statuses where GOV.UK Pay took no money, so there is nothing to mop up
 * Docs: https://docs.payments.service.gov.uk/api_reference/#payment-status-meanings
 */
const FAILED_STATUSES = ["failed", "cancelled", "error"];

interface GetUnreconciledSessions {
  sessions: {
    sessionId: string;
    flowId: string;
    flow: {
      name: string;
      team: { slug: string; name: string };
    };
    paymentStatus: {
      paymentId: string;
      status: string;
      amount: number;
      createdAt: string;
    }[];
  }[];
}

/**
 * Sessions which began a payment but have never been submitted, excluding any
 * whose most recent payment activity is still within the grace period
 */
const getCandidates = async (): Promise<PaymentCandidate[]> => {
  const since = subHours(new Date(), LOOKBACK_HOURS).toISOString();
  const gracePeriodStart = subHours(new Date(), GRACE_PERIOD_HOURS);

  const { sessions } = await $api.client.request<GetUnreconciledSessions>(
    gql`
      query GetUnreconciledSessions($since: timestamptz!) {
        sessions: lowcal_sessions(
          where: {
            submitted_at: { _is_null: true }
            deleted_at: { _is_null: true }
            payment_status: { created_at: { _gt: $since } }
          }
        ) {
          sessionId: id
          flowId: flow_id
          flow {
            name
            team {
              slug
              name
            }
          }
          paymentStatus: payment_status(
            order_by: { created_at: desc }
            limit: 1
          ) {
            paymentId: payment_id
            status
            amount
            createdAt: created_at
          }
        }
      }
    `,
    { since },
  );

  return sessions.flatMap(({ sessionId, flowId, flow, paymentStatus }) => {
    const latest = paymentStatus[0]!;

    if (new Date(latest.createdAt) > gracePeriodStart) return [];

    return [
      {
        sessionId,
        flowId,
        flowName: flow.name,
        teamSlug: flow.team.slug,
        teamName: flow.team.name,
        paymentId: latest.paymentId,
        status: latest.status,
        amount: latest.amount,
      },
    ];
  });
};

/**
 * Ask GOV.UK Pay for the current status of a payment, via our own proxy route
 *
 * Reusing `GET /pay/:localAuthority/:paymentId` means the team's GovPay token is
 * resolved and the true status is written to `payment_status` as a side effect
 */
const refetchPaymentStatus = async ({
  teamSlug,
  paymentId,
  sessionId,
  flowId,
}: PaymentCandidate): Promise<string> => {
  const { data } = await axios.get<{ state?: { status?: string } }>(
    `${process.env.API_URL_EXT}/pay/${teamSlug}/${paymentId}`,
    { params: { sessionId, flowId } },
  );

  return data?.state?.status || "unknown";
};

const formatSlackMessage = (unsubmitted: PaymentCandidate[]): string => {
  const lines = unsubmitted.map(
    ({ sessionId, teamName, flowName, amount }) =>
      `- *${sessionId}* £${(amount / 100).toFixed(2)} [${teamName}] ${flowName}`,
  );

  return `Payment taken with no submission, please investigate:\n${lines.join("\n")}`;
};

/**
 * Called by Hasura cron job `reconcile_payments`
 *
 * A "mop-up job" as recommended by GOV.UK Pay, covering the case where an applicant
 * pays but never makes it back to PlanX - leaving us with money taken and no submission
 *
 * Docs: https://docs.payments.service.gov.uk/integrate_with_govuk_pay/#use-an-automatic-mop-up-job-recommended
 */
export const reconcilePayments =
  async (): Promise<ReconcilePaymentsResponse> => {
    const candidates = await getCandidates();
    const unsubmitted: PaymentCandidate[] = [];
    const errors: string[] = [];
    let checked = 0;

    for (const candidate of candidates) {
      // No money was taken, so there is nothing to mop up
      if (FAILED_STATUSES.includes(candidate.status)) continue;

      // We already know this was paid - the submission, not the payment, is what failed
      if (candidate.status === "success") {
        unsubmitted.push(candidate);
        continue;
      }

      try {
        checked++;
        const paymentStatus = await refetchPaymentStatus(candidate);
        if (paymentStatus === "success") unsubmitted.push(candidate);
      } catch (error) {
        errors.push(
          `${candidate.sessionId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (unsubmitted.length) await postToSlack(formatSlackMessage(unsubmitted));

    return {
      message: `Checked ${checked} payment(s), found ${unsubmitted.length} paid but unsubmitted session(s)`,
      checked,
      unsubmitted: unsubmitted.length,
      errors,
    };
  };

export const postToSlack = async (text: string): Promise<void> => {
  if (process.env.APP_ENVIRONMENT !== "production") {
    console.log(`Skipping Slack notification on non-production:\n${text}`);
    return;
  }

  await sendSlackMessage({
    channel: "#planx-notifications-internal",
    text,
    username: `Payment Reconciliation Cron Job (${getFormattedEnvironment()})`,
  });
};
