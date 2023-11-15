import {
  sendSinglePaymentEmail,
  sendAgentAndPayeeConfirmationEmail,
} from "../../inviteToPay";
import { sendSingleApplicationEmail } from "../saveAndReturn/service/utils";
import { ServerError } from "../../errors";
import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { NextFunction } from "express";

interface SendEmailResponse {
  message: string;
  expiryDate?: string;
}

export const singleApplicationEmailSchema = z.object({
  body: z.object({
    payload: z.object({
      email: z.string().email(),
      sessionId: z.string(),
    }),
  }),
  params: z.object({
    template: z.enum(["reminder", "expiry", "save"]),
  }),
});

export type SingleApplicationEmail = ValidatedRequestHandler<
  typeof singleApplicationEmailSchema,
  SendEmailResponse
>;

export const singleApplicationEmailController: SingleApplicationEmail = async (
  req,
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

export const paymentEmailSchema = z.object({
  body: z.object({
    payload: z.object({
      paymentRequestId: z.string(),
    }),
  }),
  params: z.object({
    template: z.enum([
      "invite-to-pay",
      "invite-to-pay-agent",
      "payment-reminder",
      "payment-reminder-agent",
      "payment-expiry",
      "payment-expiry-agent",
    ]),
  }),
});

export type PaymentEmail = ValidatedRequestHandler<
  typeof paymentEmailSchema,
  SendEmailResponse
>;

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

export const confirmationEmailSchema = z.object({
  body: z.object({
    payload: z.object({
      sessionId: z.string(),
      lockedAt: z.string(),
      email: z.string().email(),
    }),
  }),
  params: z.object({
    template: z.enum(["confirmation"]),
  }),
});

export type ConfirmationEmail = ValidatedRequestHandler<
  typeof confirmationEmailSchema,
  SendEmailResponse
>;

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
