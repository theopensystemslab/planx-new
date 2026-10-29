import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { sendSlackMessage } from "../../slack/utils.js";
import * as connectionService from "../connect/service.js";
import { isStripePaymentsEnabled } from "../helpers.js";
import * as migrationService from "./service.js";
import type {
  MigrateResponse,
  MigrationBlocker,
  PaymentProvider,
} from "./types.js";

const FINISHED_STATUSES = new Set(["success", "failed", "cancelled", "error"]);

export const getActiveGovPaySessions = async (
  teamSlug: string,
): Promise<number> => {
  const createdAfter = new Date(Date.now() - 90 * 60 * 1000).toISOString();
  const { paymentStatuses } = await $api.client.request<{
    paymentStatuses: { paymentId: string; status: string }[];
  }>(
    gql`
      query GetActiveGovPaySessions(
        $teamSlug: String!
        $createdAfter: timestamptz!
      ) {
        paymentStatuses: payment_status(
          where: {
            team_slug: { _eq: $teamSlug }
            created_at: { _gt: $createdAfter }
          }
        ) {
          paymentId: payment_id
          status
        }
      }
    `,
    { teamSlug, createdAfter },
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

const updatePaymentProvider = async (
  teamId: number,
  paymentProvider: PaymentProvider,
): Promise<number> => {
  const { updateTeamPaymentProvider } = await $api.client.request<{
    updateTeamPaymentProvider: { affectedRows: number };
  }>(
    gql`
      mutation UpdatePaymentProvider($teamId: Int!, $paymentProvider: String!) {
        updateTeamPaymentProvider: update_team_settings(
          where: { team_id: { _eq: $teamId } }
          _set: { payment_provider: $paymentProvider }
        ) {
          affectedRows: affected_rows
        }
      }
    `,
    { teamId, paymentProvider },
  );

  return updateTeamPaymentProvider.affectedRows;
};

export const getMigrationBlockers = async (
  teamId: number,
  teamSlug: string,
): Promise<MigrateResponse> => {
  const blockers: MigrationBlocker[] = [];

  const [accountId, activeSessions] = await Promise.all([
    connectionService.getStripeAccountId(teamId),
    migrationService.getActiveGovPaySessions(teamSlug),
  ]);

  if (!isStripePaymentsEnabled(teamSlug)) {
    blockers.push({ reason: "stripePaymentsNotEnabled" });
  }
  if (!accountId) blockers.push({ reason: "stripeNotConnected" });
  if (activeSessions > 0) {
    blockers.push({ reason: "activeGovpaySessions", count: activeSessions });
  }

  return { canMigrate: blockers.length === 0, blockers };
};

export const postStripeMigratedToSlack = async (
  teamSlug: string,
  affectedRows: number,
): Promise<void> => {
  const environment = process.env.APP_ENVIRONMENT;
  if (environment !== "production" || affectedRows === 0) return;

  try {
    await sendSlackMessage(
      `:large_green_square: :tada: *${teamSlug}* has migrated to Stripe on production`,
    );
  } catch (error) {
    console.error(
      "Failed to post Stripe migrated notification to Slack",
      error,
    );
  }
};

export const migrateToStripe = async (teamId: number, teamSlug: string) => {
  const migrationCheck = await getMigrationBlockers(teamId, teamSlug);
  if (!migrationCheck.canMigrate) {
    return migrationCheck;
  }

  const affectedRows = await updatePaymentProvider(teamId, "stripe");
  await postStripeMigratedToSlack(teamSlug, affectedRows);
  return migrationCheck;
};

/** This should never be called on prod! Route itself is gated with additional env check here */
export const revertToGovPay = async (
  teamId: number,
): Promise<PaymentProvider> => {
  const environment = process.env.APP_ENVIRONMENT;
  if (environment === "production") {
    throw new Error("Cannot revert to GovPay on production");
  }

  const affectedRows = await updatePaymentProvider(teamId, "govpay");
  if (affectedRows === 0) {
    throw new Error(`Could not revert to Gov Pay for ${teamId}`);
  }
  return "govpay";
};
