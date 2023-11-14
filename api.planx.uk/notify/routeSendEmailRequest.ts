import { NextFunction, Request, Response } from "express";
import {
  sendSinglePaymentEmail,
  sendAgentAndPayeeConfirmationEmail,
} from "../inviteToPay";
import { sendSingleApplicationEmail } from "../modules/saveAndReturn/service/utils";
import { Template } from "../lib/notify";
import { ServerError } from "../errors";

export async function routeSendEmailRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, sessionId, paymentRequestId, lockedAt } = req.body.payload;
    const template = req.params.template as Template;

    const invalidTemplate = (_unknownTemplate?: never) => {
      throw new ServerError({
        message: "Invalid template",
        status: 400,
      });
    };

    const handleSingleApplicationEmail = async () => {
      if (!email || !sessionId) {
        throw new ServerError({
          status: 400,
          message: "Required value missing",
        });
      }
      const response = await sendSingleApplicationEmail({
        template,
        email,
        sessionId,
      });
      return res.json(response);
    };

    const handlePaymentEmails = async () => {
      if (!paymentRequestId) {
        throw new ServerError({
          status: 400,
          message: "Required `paymentRequestId` missing",
        });
      }
      const response = await sendSinglePaymentEmail({
        template,
        paymentRequestId,
      });
      return res.json(response);
    };

    const handleInviteToPayConfirmationEmails = async () => {
      if (!sessionId) {
        throw new ServerError({
          status: 400,
          message: "Required `sessionId` missing",
        });
      }
      const response = await sendAgentAndPayeeConfirmationEmail(sessionId);
      return res.json(response);
    };

    switch (template) {
      case "reminder":
      case "expiry":
      case "save":
        return await handleSingleApplicationEmail();
      case "invite-to-pay":
      case "invite-to-pay-agent":
      case "payment-reminder":
      case "payment-reminder-agent":
      case "payment-expiry":
      case "payment-expiry-agent":
        return await handlePaymentEmails();
      case "confirmation": {
        // if the session is locked we can infer that a payment request has been initiated
        const paymentRequestInitiated = Boolean(lockedAt);
        if (paymentRequestInitiated) {
          return await handleInviteToPayConfirmationEmails();
        } else {
          return await handleSingleApplicationEmail();
        }
      }
      case "resume":
      case "submit":
      case "confirmation-agent":
      case "confirmation-payee":
        // templates that are already handled by other routes
        return invalidTemplate();
      default:
        return invalidTemplate(template);
    }
  } catch (error) {
    next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to send "${req.params.template}" email. ${
          (error as Error).message
        }`,
      }),
    );
  }
}
