import type { NextFunction } from "express";
import { gql } from "graphql-request";

import { $api } from "../../client/index.js";
import { ServerError } from "../../errors/index.js";
import { sendEmail } from "../../lib/resend/index.js";
import type { TemplateRegistry } from "../../lib/resend/templates/index.js";
import {
  sendAgentAndPayeeConfirmationEmail,
  sendSinglePaymentEmail,
} from "../pay/service/inviteToPay/index.js";
import { sendSingleApplicationEmail } from "../saveAndReturn/service/utils.js";
import type {
  ConfirmationEmail,
  PaymentEmail,
  ResendEmail,
  SingleApplicationEmail,
} from "./types.js";

export const singleApplicationEmailController: SingleApplicationEmail = async (
  _req,
  res,
  next,
) => {
  const { email, sessionId } = res.locals.parsedReq.body.payload;
  const { template } = res.locals.parsedReq.params;

  try {
    // A locked session is waiting on a payment, which will submit it - it can't be resumed, so "your application will expire" doesn't apply
    if (LOCK_SKIPPED_TEMPLATES.includes(template)) {
      const { isLocked } = await getSessionLock(sessionId);
      if (isLocked) {
        return res.json({
          message: `Skipping "${template}" email: session ${sessionId} is locked awaiting payment`,
        });
      }
    }

    const response = await sendSingleApplicationEmail({
      template,
      email,
      sessionId,
    });
    return res.json(response);
  } catch (error) {
    emailErrorHandler(next, error, template, sessionId);
  }
};

export const paymentEmailController: PaymentEmail = async (_req, res, next) => {
  const { paymentRequestId } = res.locals.parsedReq.body.payload;
  const { template } = res.locals.parsedReq.params;

  try {
    const response = await sendSinglePaymentEmail({
      template,
      paymentRequestId,
    });
    return res.json(response);
  } catch (error) {
    emailErrorHandler(
      next,
      error,
      template,
      `(payment request) ${paymentRequestId}`,
    );
  }
};

export const confirmationEmailController: ConfirmationEmail = async (
  _req,
  res,
  next,
) => {
  const { lockedAt, sessionId, email } = res.locals.parsedReq.body.payload;
  const { template } = res.locals.parsedReq.params;

  try {
    // A locked session has an invite to pay request, or was paid by a delayed payment method (e.g. Bacs)
    // only the itp ones have a payee to email
    const paymentRequestInitiated =
      Boolean(lockedAt) && (await getSessionLock(sessionId)).hasPaymentRequest;
    if (paymentRequestInitiated) {
      const response = await sendAgentAndPayeeConfirmationEmail(sessionId);
      return res.json(response);
    } else {
      const response = await sendSingleApplicationEmail({
        template,
        email,
        sessionId,
      });
      return res.json(response);
    }
  } catch (error) {
    emailErrorHandler(next, error, template, sessionId);
  }
};

export const resendEmailController: ResendEmail = async (_req, res, next) => {
  const { payload } = res.locals.parsedReq.body;

  try {
    const isTrial = await getTeamIsTrial(payload.defaultTeamId);
    const variables: TemplateRegistry["welcome"]["variables"] = {
      firstName: payload.firstName,
      subscriptionStatus: isTrial ? "Trial" : "Active",
    };

    const response = await sendEmail("welcome", payload.email, variables);
    return res.status(200).send(response);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to send "welcome" email. ${(error as Error).message}`,
        cause: error,
      }),
    );
  }
};

interface GetTeamSettings {
  teamSettings: {
    isTrial: boolean;
  }[];
}

const getTeamIsTrial = async (teamId: number | null): Promise<boolean> => {
  if (!teamId) return false;

  const { teamSettings } = await $api.client.request<GetTeamSettings>(
    gql`
      query GetTeamIsTrial($teamId: Int!) {
        teamSettings: team_settings(where: { team_id: { _eq: $teamId } }) {
          isTrial: is_trial
        }
      }
    `,
    { teamId },
  );

  return teamSettings[0]?.isTrial ?? false;
};

const LOCK_SKIPPED_TEMPLATES: readonly string[] = [
  "reminder",
  "expiry",
  "general-reminder",
  "general-expiry",
];

/**
 * A session is locked while an invite to pay request is open, or while a delayed payment (e.g. Bacs) is processing
 */
const getSessionLock = async (
  sessionId: string,
): Promise<{ isLocked: boolean; hasPaymentRequest: boolean }> => {
  const { session } = await $api.client.request<{
    session: {
      lockedAt: string | null;
      paymentRequests: { id: string }[];
    } | null;
  }>(
    gql`
      query GetSessionLock($sessionId: uuid!) {
        session: lowcal_sessions_by_pk(id: $sessionId) {
          lockedAt: locked_at
          paymentRequests: payment_requests(limit: 1) {
            id
          }
        }
      }
    `,
    { sessionId },
  );

  return {
    isLocked: Boolean(session?.lockedAt),
    hasPaymentRequest: Boolean(session?.paymentRequests.length),
  };
};

const emailErrorHandler = (
  next: NextFunction,
  error: unknown,
  template: string,
  sessionId: string,
) =>
  next(
    new ServerError({
      status: error instanceof ServerError ? error.status : undefined,
      message: `Failed to send "${template}" email for session ${sessionId}. ${
        (error as Error).message
      }`,
    }),
  );
