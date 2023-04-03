import { NextFunction, Request, Response } from "express";
import type { PaymentRequest, KeyPath } from "@opensystemslab/planx-core";

import { ServerError } from "../errors";
import { _admin } from "../client";

export async function inviteToPay(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.params.sessionId;
  const {
    payeeEmail,
    payeeName,
    sessionPreviewKeys,
  }: {
    payeeEmail: string;
    payeeName: string;
    sessionPreviewKeys: Array<KeyPath>;
  } = req.body;

  if (!payeeEmail) {
    return next(
      new ServerError({
        message: "JSON body must contain payeeEmail",
        status: 400,
      })
    );
  }
  if (!payeeName) {
    return next(
      new ServerError({
        message: "JSON body must contain payeeName",
        status: 400,
      })
    );
  }

  let paymentRequest: PaymentRequest | undefined;
  try {
    // make session read-only before creating a payment request
    // createPaymentRequest will fail if the session fails to lock
    await _admin.lockSession(sessionId);
    paymentRequest = await _admin.createPaymentRequest({
      sessionId,
      payeeName,
      payeeEmail,
      sessionPreviewKeys,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message == "session not found") {
      return next(
        new ServerError({
          message: "session not found",
          status: 404,
        })
      );
    } else {
      return next(
        new ServerError({
          message: "Could not initiate payment request",
          status: 500,
          cause: e,
        })
      );
    }
  }

  res.json(paymentRequest);
}
