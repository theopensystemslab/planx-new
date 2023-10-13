import { NextFunction, Request, Response } from "express";
import type { PaymentRequest, KeyPath } from "@opensystemslab/planx-core/types";

import { ServerError } from "../errors";
import { $api } from "../client";

export async function inviteToPay(
  req: Request,
  res: Response,
  next: NextFunction,
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
        }),
      );
    }
  }

  // lock session before creating a payment request
  const locked = await $api.lockSession(sessionId);
  if (locked === null) {
    return next(
      new ServerError({
        message: "session not found",
        status: 404,
      }),
    );
  }
  if (locked === false) {
    const cause = new Error(
      "this session could not be locked, perhaps because it is already locked",
    );
    return next(
      new ServerError({
        message: `could not initiate a payment request: ${cause.message}`,
        status: 400,
        cause,
      }),
    );
  }

  let paymentRequest: PaymentRequest | undefined;
  try {
    paymentRequest = await $api.createPaymentRequest({
      sessionId,
      applicantName,
      payeeName,
      payeeEmail,
      sessionPreviewKeys,
    });
  } catch (e: unknown) {
    // revert the session lock on failure
    await $api.unlockSession(sessionId);
    return next(
      new ServerError({
        message:
          e instanceof Error
            ? `could not initiate a payment request: ${e.message}`
            : "could not initiate a payment request due to an unknown error",
        status: 500,
        cause: e,
      }),
    );
  }

  res.json(paymentRequest);
}
