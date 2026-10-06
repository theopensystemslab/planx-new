import type { TeamSettings } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import * as connectionService from "../connect/service.js";
import * as migrationService from "./service.js";
import type { MigrateResponse, MigrationBlocker } from "./types.js";

const FINISHED_STATUSES = new Set(["success", "failed", "cancelled", "error"]);
export type PaymentProvider = TeamSettings["paymentProvider"];

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

// const updatePaymentProvider = async (
//   teamId: number,
//   paymentProvider: PaymentProvider,
// ): Promise<number> => {
//     const { updateTeamPaymentProvider } = await $api.client.request<{
//     updateTeamPaymentProvider: { affectedRows: number };
//   }>(
//     gql`
//       mutation UpdatePaymentProvider($teamId: Int!, $paymentProvider: String!) {
//         updateTeamPaymentProvider:update_team_settings(
//           where: {team_id: {_eq: $teamId}},
//           _set: {payment_provider: $paymentProvider}
//         ) {
//           affectedRows: affected_rows
//         }
//       }
//     `,
//     { teamId, paymentProvider },
//   );

//   return updateTeamPaymentProvider.affectedRows;
// }

// TODO: check checkout config
export const isCheckoutConfigured = async (
  _teamSlug: string,
): Promise<boolean> => true;

export const getMigrationBlockers = async (
  teamId: number,
  teamSlug: string,
): Promise<MigrateResponse> => {
  const blockers: MigrationBlocker[] = [];

  const [accountId, activeSessions, checkoutConfigured] = await Promise.all([
    connectionService.getStripeAccountId(teamId),
    migrationService.getActiveGovPaySessions(teamSlug),
    migrationService.isCheckoutConfigured(teamSlug),
  ]);

  if (!accountId) blockers.push({ reason: "stripeNotConnected" });
  if (activeSessions > 0) {
    blockers.push({ reason: "activeGovpaySessions", count: activeSessions });
  }
  if (!checkoutConfigured) blockers.push({ reason: "checkoutNotConfigured" });

  return { canMigrate: blockers.length === 0, blockers };
};

export const migrateToStripe = async (teamId: number, teamSlug: string) => {
  const migrationCheck = await getMigrationBlockers(teamId, teamSlug);
  if (!migrationCheck.canMigrate) {
    return migrationCheck;
  }

  // TODO: perform actual migration and then re-enable updatePaymentProvider mutation below
  // await updatePaymentProvider(teamId, "stripe");
  return { canMigrate: true, blockers: [] }; // placeholder for now
};
