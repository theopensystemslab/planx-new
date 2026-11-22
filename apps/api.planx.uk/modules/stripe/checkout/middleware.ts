import type { Session } from "@opensystemslab/planx-core/types";
import { isBefore } from "date-fns";
import type Stripe from "stripe";

import {
  getPaymentCapabilities,
  getStripeAccounts,
  getTeamBySlug,
} from "../connect/service.js";
import { isStripePaymentsEnabled } from "../helpers.js";
import {
  getMinimumCheckoutSessionExpiry,
  getPaymentRequest,
  getPaymentRequestExpiry,
} from "./paymentRequest.js";
import { buildReturnURL, getReturnURLContext } from "./returnURL.js";
import { getSessionPassportData } from "./service.js";
import {
  getLocalAuthorityDistricts,
  selectStripeAccount,
} from "./stripeAccount.js";
import type {
  FetchPaymentRequestMiddleware,
  ResolvePaymentRequestConnectedAccountMiddleware,
  ResolveReturnURLMiddleware,
  ResolveTeamPaymentProviderMiddleware,
} from "./types.js";

type ConnectedAccountResult =
  | { connectedAccountId: string; capabilities: Stripe.Account.Capabilities }
  | { refusal: { status: number; message: string } };

type PassportData = Session["data"]["passport"]["data"];

/**
 * The team must be on Stripe, with a connected account which is ready to take payments
 *
 * A team with multiple accounts is paid into the account for the site's local authority district
 * The passport is only needed (and fetched) for these teams
 */
const getConnectedAccount = async (
  teamSlug: string,
  getPassportData: () => Promise<PassportData | undefined>,
): Promise<ConnectedAccountResult> => {
  if (!isStripePaymentsEnabled(teamSlug)) {
    return {
      refusal: { status: 409, message: "Stripe payments are not yet enabled" },
    };
  }

  const team = await getTeamBySlug(teamSlug);
  const { paymentProvider } = team.settings;

  if (paymentProvider !== "stripe") {
    return {
      refusal: {
        status: 409,
        message: `Stripe payments are not enabled for this local authority (${teamSlug})`,
      },
    };
  }

  const accounts = await getStripeAccounts(team.id);
  const hasMultipleAccounts = accounts.length > 1;

  const districts = hasMultipleAccounts
    ? getLocalAuthorityDistricts(await getPassportData())
    : [];
  const selection = selectStripeAccount(accounts, districts);

  const notConnected = {
    refusal: {
      status: 409,
      message: `This local authority (${teamSlug}) has not connected a Stripe account`,
    },
  };

  if ("refusal" in selection) {
    if (selection.refusal === "noAccount") return notConnected;

    const reason =
      selection.refusal === "multipleMatchingAccounts"
        ? "the site is in the area of more than one of its Stripe accounts"
        : "the site's local authority district doesn't match any of its Stripe accounts";

    return {
      refusal: {
        status: 409,
        message: `Could not choose a Stripe account for this local authority (${teamSlug}) - ${reason}`,
      },
    };
  }

  const { name, accountId: stripeAccountId } = selection.account;
  const accountLabel = hasMultipleAccounts ? ` (${name})` : "";

  if (!stripeAccountId) {
    if (!hasMultipleAccounts) return notConnected;

    return {
      refusal: {
        status: 409,
        message: `This local authority (${teamSlug}) has not connected its Stripe account${accountLabel}`,
      },
    };
  }

  // Only pay out to an account which is connected to our platform, never to an unknown account id
  const capabilities = await getPaymentCapabilities(stripeAccountId);
  if (!capabilities) {
    return {
      refusal: {
        status: 409,
        message: `The Stripe account${accountLabel} for this local authority (${teamSlug}) is not connected or cannot take payments`,
      },
    };
  }

  return { connectedAccountId: stripeAccountId, capabilities };
};

export const resolveTeamPaymentProvider: ResolveTeamPaymentProviderMiddleware =
  async (_req, res, next) => {
    const { localAuthority } = res.locals.parsedReq.params;
    const { sessionId } = res.locals.parsedReq.body;

    try {
      const result = await getConnectedAccount(localAuthority, () =>
        getSessionPassportData(sessionId),
      );
      if ("refusal" in result) return next(result.refusal);

      res.locals.connectedAccountId = result.connectedAccountId;
      res.locals.capabilities = result.capabilities;

      return next();
    } catch (error) {
      return next(error);
    }
  };

/**
 * Build the URL Stripe sends the applicant back to after checkout
 *
 * Derived server-side from the flow and session so a Checkout Session can never send applicants
 * on to a third-party site
 */
export const resolveReturnURL: ResolveReturnURLMiddleware = async (
  _req,
  res,
  next,
) => {
  const { localAuthority } = res.locals.parsedReq.params;
  const { flowId, sessionId } = res.locals.parsedReq.body;

  try {
    const { flow, session } = await getReturnURLContext(flowId, sessionId);

    if (!flow || flow.team.slug !== localAuthority) {
      return next({
        status: 400,
        message: `Flow ${flowId} not found for this local authority (${localAuthority})`,
      });
    }

    if (session && session.flowId !== flowId) {
      return next({
        status: 400,
        message: `Session ${sessionId} does not belong to flow ${flowId}`,
      });
    }

    if (session?.lockedAt) {
      return next({
        status: 409,
        message: `Cannot initialise a new payment for locked session ${sessionId}`,
      });
    }

    res.locals.returnURL = buildReturnURL(flow, sessionId, session?.email);

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Load an invite to pay request, refusing any which can no longer be paid via Stripe
 */
export const fetchPaymentRequest: FetchPaymentRequestMiddleware = async (
  _req,
  res,
  next,
) => {
  const { paymentRequestId } = res.locals.parsedReq.params;

  try {
    const paymentRequest = await getPaymentRequest(paymentRequestId);

    if (!paymentRequest) {
      return next({
        status: 404,
        message: `Payment request ${paymentRequestId} not found`,
      });
    }

    if (paymentRequest.paidAt) {
      return next({
        status: 409,
        message: `Payment request ${paymentRequestId} has already been paid`,
      });
    }

    // Stripe also needs enough time left to open a Checkout Session
    const expiresAt = getPaymentRequestExpiry(paymentRequest.createdAt);
    if (isBefore(expiresAt, getMinimumCheckoutSessionExpiry(new Date()))) {
      return next({
        status: 410,
        message: `Payment request ${paymentRequestId} has expired`,
      });
    }

    const { session } = paymentRequest;
    if (!session || session.deletedAt) {
      return next({
        status: 410,
        message: `The session for payment request ${paymentRequestId} has been deleted`,
      });
    }

    if (!session.lockedAt) {
      return next({
        status: 409,
        message: `The session for payment request ${paymentRequestId} is not awaiting payment`,
      });
    }

    // A GovPay payment has already been started - this request stays on GovPay until paid or expired
    if (paymentRequest.govPayPaymentId) {
      return next({
        status: 409,
        message: `Payment request ${paymentRequestId} must be paid via GOV.UK Pay`,
      });
    }

    res.locals.paymentRequest = {
      ...paymentRequest,
      session,
      expiresAt,
      metadata: paymentRequest.stripeMetadata,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const resolvePaymentRequestConnectedAccount: ResolvePaymentRequestConnectedAccountMiddleware =
  async (_req, res, next) => {
    const { session } = res.locals.paymentRequest;

    try {
      const result = await getConnectedAccount(session.flow.team.slug, () =>
        Promise.resolve(session.passport?.data),
      );
      if ("refusal" in result) return next(result.refusal);

      res.locals.connectedAccountId = result.connectedAccountId;
      res.locals.capabilities = result.capabilities;

      return next();
    } catch (error) {
      return next(error);
    }
  };
