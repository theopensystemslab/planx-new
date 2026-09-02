import type { Team } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import Stripe from "stripe";

import { $api } from "../../client/index.js";
import { ServerError } from "../../errors/index.js";

const getStripeClient = (): Stripe => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new ServerError({
      status: 500,
      message: "STRIPE_SECRET_KEY is not configured",
    });
  }
  return new Stripe(secretKey);
};

export const getCallbackUrl = (): string =>
  `${process.env.API_URL_EXT}/stripe/connect/callback`;

export const getTeamBySlug = async (teamSlug: string): Promise<Team> => {
  const team = await $api.team.getBySlug(teamSlug);
  if (!team) {
    throw new ServerError({
      status: 404,
      message: `Team not found: ${teamSlug}`,
    });
  }
  return team;
};

/**
 * Build the Stripe OAuth URL for a Standard Connect account
 * The council logs into their own Stripe account here and approves access
 * Docs: https://docs.stripe.com/connect/oauth-standard-accounts
 */
export const buildAuthoriseUrl = (state: string): string => {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!clientId) {
    throw new ServerError({
      status: 500,
      message: "STRIPE_CONNECT_CLIENT_ID is not configured",
    });
  }

  const stripe = getStripeClient();

  return stripe.oauth.authorizeUrl({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: getCallbackUrl(),
    state,
  });
};

/**
 * After successful oAuth connect, Stripe returns an auth code,
 * which we can exchange for an oauth token,
 * which also contains the Stripe account ID of the connected account
 */
export const exchangeCodeForAccountId = async (
  code: string,
): Promise<string> => {
  const stripe = getStripeClient();

  let token: Stripe.OAuthToken;
  try {
    token = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Unknown error";
    throw new ServerError({
      status: 502,
      message: `Stripe OAuth token exchange failed: ${message}`,
      cause: error,
    });
  }

  if (!token.stripe_user_id) {
    throw new ServerError({
      status: 502,
      message:
        "Stripe OAuth token exchange did not return a connected account id",
    });
  }

  return token.stripe_user_id;
};

// Staging uses Stripe test mode keys, production uses live mode keys
export const getStripeMode = (): "test" | "live" =>
  process.env.APP_ENVIRONMENT === "production" ? "live" : "test";

/**
 * `team_integrations` stores separate columns per environment
 */
const stripeAccountIdColumn = (): string =>
  getStripeMode() === "live"
    ? "production_stripe_account_id"
    : "staging_stripe_account_id";

export const saveStripeAccountId = async (
  teamId: number,
  accountId: string,
): Promise<void> => {
  const column = stripeAccountIdColumn();

  await $api.client.request(
    gql`
      mutation SaveStripeAccountId($teamId: Int!, $accountId: String!) {
        update_team_integrations(
          where: { team_id: { _eq: $teamId } }
          _set: { ${column}: $accountId }
        ) {
          affected_rows
        }
      }
    `,
    { teamId, accountId },
  );
};

export const getStripeAccountId = async (
  teamId: number,
): Promise<string | null> => {
  const column = stripeAccountIdColumn();

  const { team_integrations } = await $api.client.request<{
    team_integrations: { accountId: string | null }[];
  }>(
    gql`
      query GetStripeAccountId($teamId: Int!) {
        team_integrations(where: { team_id: { _eq: $teamId } }) {
          accountId: ${column}
        }
      }
    `,
    { teamId },
  );

  return team_integrations[0]?.accountId ?? null;
};
