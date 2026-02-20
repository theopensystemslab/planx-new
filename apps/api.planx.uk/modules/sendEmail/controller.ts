import {
  sendSinglePaymentEmail,
  sendAgentAndPayeeConfirmationEmail,
} from "../pay/service/inviteToPay/index.js";
import { sendSingleApplicationEmail } from "../saveAndReturn/service/utils.js";
import { ServerError } from "../../errors/index.js";
import type { NextFunction } from "express";
import type {
  ConfirmationEmail,
  PaymentEmail,
  ResendEmail,
  SingleApplicationEmail,
} from "./types.js";
import { sendEmail } from "../../lib/resend/index.js";

export const singleApplicationEmailController: SingleApplicationEmail = async (
  _req,
  res,
  next,
) => {
  const { email, sessionId } = res.locals.parsedReq.body.payload;
  const { template } = res.locals.parsedReq.params;

  try {
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
    // if the session is locked we can infer that a payment request has been initiated
    const paymentRequestInitiated = Boolean(lockedAt);
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

export const resendEmailController: ResendEmail = async (
  _req,
  res,
  next,
) => {
  const { payload } = res.locals.parsedReq.body;
  const { template } = res.locals.parsedReq.params;

  const isProduction = process.env.APP_ENVIRONMENT === "production";
  if (!isProduction) {
    return res.status(200).send({
      message: `Non-production environment: skipping email send template: ${template}`,
    });
  }
  try {
    const response = await sendEmail({ ...payload, template });
    return res.status(200).send(response);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to send ${template} email. ${(error as Error).message}`,
        cause: error,
      }),
    );
  }
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
