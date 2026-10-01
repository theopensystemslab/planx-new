import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { getStripeAccountId } from "../connect/service.js";
import type { CanMigrateResponse, MigrationBlocker } from "./types.js";

const FINISHED_STATUSES = new Set(["success", "failed", "cancelled"]);

export const getActiveGovPaySessions = async (
  teamSlug: string,
): Promise<number> => {
  const { paymentStatuses } = await $api.client.request<{
    paymentStatuses: { paymentId: string; status: string }[];
  }>(
    gql`
      query GetActiveGovPaySessions($teamSlug: String!) {
        paymentStatuses: payment_status(
          where: { team_slug: { _eq: $teamSlug } }
        ) {
          paymentId: payment_id
          status
        }
      }
    `,
    { teamSlug },
  );

  const statusesByPaymentId = new Map<string, Set<string>>();
  for (const { paymentId, status } of paymentStatuses ?? []) {
    const statuses = statusesByPaymentId.get(paymentId) ?? new Set<string>();
    statuses.add(status);
    statusesByPaymentId.set(paymentId, statuses);
  }

  let activeSessionsCount = 0;
  for (const statuses of statusesByPaymentId.values()) {
    const isActive =
      statuses.has("created") &&
      ![...FINISHED_STATUSES].some((terminal) => statuses.has(terminal));
    if (isActive) activeSessionsCount++;
  }
  return activeSessionsCount;
};

// TODO: check checkout config
export const isCheckoutConfigured = async (
  _teamSlug: string,
): Promise<boolean> => true;

export const getMigrationBlockers = async (
  teamId: number,
  teamSlug: string,
): Promise<CanMigrateResponse> => {
  const blockers: MigrationBlocker[] = [];

  const [accountId, activeSessions, checkoutConfigured] = await Promise.all([
    getStripeAccountId(teamId),
    getActiveGovPaySessions(teamSlug),
    isCheckoutConfigured(teamSlug),
  ]);

  if (!accountId) blockers.push({ reason: "stripeNotConnected" });
  if (activeSessions > 0) {
    blockers.push({ reason: "activeGovpaySessions", count: activeSessions });
  }
  if (!checkoutConfigured) blockers.push({ reason: "checkoutNotConfigured" });

  return { canMigrate: blockers.length === 0, blockers };
};
