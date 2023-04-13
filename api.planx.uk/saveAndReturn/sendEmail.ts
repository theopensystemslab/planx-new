import { NextFunction, Request, Response } from "express";
import { sendSingleApplicationEmail, Template } from "./utils";

const sendSaveAndReturnEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, sessionId } = req.body.payload;
    const template = req.params.template as Template;
    if (!email || !sessionId)
      return next({
        status: 400,
        message: "Required value missing",
      });
    const response = await sendSingleApplicationEmail(
      template,
      email,
      sessionId
    );
    return res.json(response);
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
