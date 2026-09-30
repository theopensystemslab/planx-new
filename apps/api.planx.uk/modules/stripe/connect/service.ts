import type { Team } from "@opensystemslab/planx-core/types";
import { getUnixTime } from "date-fns";
import { gql } from "graphql-request";
import Stripe from "stripe";

import { $api } from "../../../client/index.js";
import { ServerError } from "../../../errors/index.js";
import { sendSlackMessage } from "../../slack/utils.js";
import { stripe } from "../client.js";

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

  return stripe.oauth.authorizeUrl({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: getCallbackUrl(),
    state,
    stripe_landing: "login",
  });
};

/**
 * Who is creating the test account - Stripe requires declarations to record where they were made from
 */
export interface TestAccountAttestation {
  ip: string;
  userAgent?: string;
}

/**
 * Staging (test mode) only - create a Stripe account for the team, prefilled with Stripe's test data,
 * so the user only needs to confirm the details during onboarding rather than type them all in
 *
 * The account belongs to whichever Stripe user signs in or signs up during onboarding (via an account link),
 * so it appears in their own Stripe dashboard afterwards
 *
 * Prefill must happen before the first account link is created, as Stripe then locks identity information
 * Docs: https://docs.stripe.com/connect/hosted-onboarding
 * Test values: https://docs.stripe.com/connect/testing
 */
export const createPrefilledTestAccount = async (
  team: Team,
  attestation: TestAccountAttestation,
): Promise<string> => {
  const name = `${team.name} (test mode)`;
  const url = team.settings?.homepage || "https://www.planx.uk";
  const phone = "+447400123456";
  const email = "stripe-test-representative@planx.uk";
  const address = {
    line1: "address_full_match",
    city: "London",
    postal_code: "SW1A 1AA",
  };

  const account = await stripe.accounts.create({
    // Equivalent to a Standard account - full Stripe dashboard access, Stripe collects requirements
    controller: {
      stripe_dashboard: { type: "full" },
      fees: { payer: "account" },
      losses: { payments: "stripe" },
      requirement_collection: "stripe",
    },
    // Setting country and requesting capabilities up front lets onboarding skip the business location/type step
    country: "GB",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
      // Don't request bacs_debit_payments or bank_transfer_payments until checkout offers them -
      // both add a proof of liveness (photo ID + selfie) step to onboarding, and Stripe has no test value to prefill it
    },
    business_type: "company",
    business_profile: {
      name,
      url,
      product_description: "Planning application and service fees",
      mcc: "9399", // Government services
      // Public details shown to customers
      support_phone: phone,
      support_email: email,
      support_url: url,
    },
    company: {
      name,
      // None of the GB company structures fit a council, this is just the closest for test data
      structure: "public_corporation",
      // For GB companies, Stripe stores the Companies House registration number (CRN) as `tax_id`
      tax_id: "12345678",
      phone,
      address,
      directors_provided: true,
      executives_provided: true,
      owners_provided: true,
    },
    external_account: {
      object: "bank_account",
      country: "GB",
      currency: "gbp",
      routing_number: "108800",
      account_number: "00012345",
    },
    metadata: { planxTeamId: String(team.id), planxTeamSlug: team.slug },
  });

  await stripe.accounts.createPerson(account.id, {
    first_name: "Test",
    last_name: "Representative",
    dob: { day: 1, month: 1, year: 1901 },
    email,
    phone,
    address,
    relationship: {
      representative: true,
      director: true,
      executive: true,
      title: "Head of Planning",
    },
    // Simulates identity and proof of address checks passing
    verification: {
      document: { front: "file_identity_document_success" },
      additional_document: { front: "file_identity_document_success" },
    },
  });

  // Simulates the representative signing the directorship and representative declarations
  const declaration = {
    date: getUnixTime(new Date()),
    ip: attestation.ip,
    user_agent: attestation.userAgent,
  };

  // Stripe only accepts declarations on account updates, not creation - and they should follow the director being added
  await stripe.accounts.update(account.id, {
    company: {
      directorship_declaration: declaration,
      representative_declaration: declaration,
    },
  });

  return account.id;
};

/**
 * Single-use link to Stripe-hosted onboarding for an account
 * Link expiry sends the user to `refresh_url`, which starts the connect flow again and resumes the same account
 * Docs: https://docs.stripe.com/api/account_links/create
 */
export const createOnboardingLink = async (
  accountId: string,
  teamSlug: string,
): Promise<string> => {
  const { url } = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${process.env.API_URL_EXT}/stripe/connect/${teamSlug}`,
    return_url: `${process.env.API_URL_EXT}/stripe/connect/${teamSlug}/return`,
  });
  return url;
};

/**
 * Check if Stripe rejected the request (e.g. the account was deleted)
 */
export const isInvalidRequestError = (error: unknown): boolean =>
  error instanceof Stripe.errors.StripeInvalidRequestError;

/**
 * Stripe redirects to the account link `return_url` whether or not onboarding was finished
 * `details_submitted` tells us if the user actually completed it
 */
export const isOnboardingComplete = async (
  accountId: string,
): Promise<boolean> => {
  const account = await stripe.accounts.retrieve(accountId);
  return account.details_submitted;
};

/**
 * After successful oAuth connect, Stripe returns an auth code,
 * which we can exchange for an oauth token,
 * which also contains the Stripe account ID of the connected account
 */
export const exchangeCodeForAccountId = async (
  code: string,
): Promise<string> => {
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
const stripeAccountIdColumn = () =>
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
        # Automatically populate team_settings.provider if currently empty
        # Migrations from GovPay are not automatic, and must be triggered by and Editor
        update_team_settings(
          where: {
            team_id: { _eq: $teamId }
            payment_provider: { _is_null: true }
          }
          _set: { payment_provider: "stripe" }
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

  const { teamIntegrations } = await $api.client.request<{
    teamIntegrations: { accountId: string | null }[];
  }>(
    gql`
      query GetStripeAccountId($teamId: Int!) {
        teamIntegrations: team_integrations(where: { team_id: { _eq: $teamId } }) {
          accountId: ${column}
        }
      }
    `,
    { teamId },
  );

  return teamIntegrations[0]?.accountId ?? null;
};

export const postStripeConnectedToSlack = async (
  teamSlug: string,
  accountId: string,
): Promise<void> => {
  const environment = process.env.APP_ENVIRONMENT;
  if (environment !== "production" && environment !== "staging") return;

  try {
    await sendSlackMessage(
      `:link: *${teamSlug}* has connected their Stripe account in *${getStripeMode()}* mode and completed onboarding - \`${accountId}\``,
    );
  } catch (error) {
    console.error(
      "Failed to post Stripe connected notification to Slack",
      error,
    );
  }
};
