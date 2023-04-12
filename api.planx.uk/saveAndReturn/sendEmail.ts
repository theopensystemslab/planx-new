import { NextFunction, Request, Response } from "express";
import { sendSingleApplicationEmail, Template } from "./utils";
import { sendSinglePaymentEmail } from "../inviteToPay";

const routeSendEmailRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, sessionId, paymentRequestId } = req.body.payload;
    const template = req.params.template as Template;
    
    if (paymentRequestId) {
      const response = await sendSinglePaymentEmail(
        template,
        paymentRequestId,
      );
      return res.json(response);
    } else if (email && sessionId) {
      const response = await sendSingleApplicationEmail(
        template,
        email,
        sessionId
      );
      return res.json(response);
    } else if (!email || !sessionId || !paymentRequestId) {
      return next({
        status: 400,
        message: "Required value missing",
      });
    }
  } catch (error) {
    return next({
      error,
      message: `Failed to send ${req.params.template} email. ${
        (error as Error).message
      }`,
    });
  }
};

export { routeSendEmailRequest };
