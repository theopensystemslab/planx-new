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
    applicantName,
    sessionPreviewKeys,
  }: {
    payeeEmail: string;
    payeeName: string;
    applicantName: string;
    sessionPreviewKeys: Array<KeyPath>;
  } = req.body;

  for (const [requiredFieldName, requiredFieldValue] of Object.entries({
    sessionId,
    applicantName,
    payeeName,
    payeeEmail,
  })) {
    if (!requiredFieldValue) {
      return next(
        new ServerError({
          message: `JSON body must contain ${requiredFieldName}`,
          status: 400,
        })
      );
    }
  }

  // lock session before creating a payment request
  const locked = await _admin.lockSession(sessionId);
  if (locked === null) {
    return next(
      new ServerError({
        message: "session not found",
        status: 404,
      })
    );
  }
  if (locked === false) {
    return next(
      new ServerError({
        message: "a payment request cannot be initiated for this session",
        status: 500,
        cause: new Error("session could not be locked"),
      })
    );
  }

  let paymentRequest: PaymentRequest | undefined;
  try {
    paymentRequest = await _admin.createPaymentRequest({
      sessionId,
      applicantName,
      payeeName,
      payeeEmail,
      sessionPreviewKeys,
    });
  } catch (e: unknown) {
    // revert the session lock on failure
    await _admin.unlockSession(sessionId);
    return next(
      new ServerError({
        message: "could not initiate a payment request",
        status: 500,
        cause: e,
      })
    );
  }

  res.json(paymentRequest);
}
