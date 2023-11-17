import {
  sendSinglePaymentEmail,
  sendAgentAndPayeeConfirmationEmail,
} from "../pay/service/inviteToPay";
import { sendSingleApplicationEmail } from "../saveAndReturn/service/utils";
import { ServerError } from "../../errors";
import { NextFunction } from "express";
import {
  ConfirmationEmail,
  PaymentEmail,
  SingleApplicationEmail,
} from "./types";

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
    emailErrorHandler(next, error, template);
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
    emailErrorHandler(next, error, template);
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
    emailErrorHandler(next, error, template);
  }
};

const emailErrorHandler = (
  next: NextFunction,
  error: unknown,
  template: string,
) =>
  next(
    new ServerError({
      status: error instanceof ServerError ? error.status : undefined,
      message: `Failed to send "${template}" email. ${
        (error as Error).message
      }`,
    }),
  );
