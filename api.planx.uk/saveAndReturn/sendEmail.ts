import { NextFunction, Request, Response } from "express";
import { sendSingleApplicationEmail, Template } from "./utils";
import { sendSinglePaymentEmail } from "../inviteToPay";

const sendSaveAndReturnEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, sessionId, paymentRequestId } = req.body.payload;
    const template = req.params.template as Template;
    
    if (!email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing",
      });

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

export { sendSaveAndReturnEmail };
