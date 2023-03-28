import { NextFunction, Request, Response } from "express";
import { validate as validateUUID, version as getUUIDVersion } from "uuid";
import type {
  Session,
  PaymentRequest,
} from "@opensystemslab/planx-core/types/types";

import { ServerError } from "../errors";
import { _admin } from "../client";

export async function inviteToPay(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.params.sessionId;
  const payeeEmail = req.body.payeeEmail;

  if (!isValidIdFormat(sessionId)) {
    return next(
      new ServerError({
        message: "invalid sessionId parameter",
        status: 400,
      })
    );
  }

  if (!payeeEmail) {
    return next(
      new ServerError({
        message: "JSON body must contain payeeEmail",
        status: 400,
      })
    );
  }

  const session: Session = await _admin.getSessionById(sessionId);

  if (!session) {
    return next(
      new ServerError({
        message: "session not found",
        status: 404,
      })
    );
  }

  // posts to this endpoint are expected to occur only for valid scenarios
  // any validation errors are logged but undisclosed to the caller
  const canInviteToPay = validateSessionIsEligibleForInviteToPay({
    email: payeeEmail,
    session,
  });
  if (!canInviteToPay) {
    return next(
      new ServerError({
        message: "invalid invite to pay session",
        status: 422,
      })
    );
  }

  let paymentRequest: PaymentRequest | undefined;
  try {
    // make session read-only before creating a payment request
    await _admin.lockSession(sessionId);
    paymentRequest = await _admin.createPaymentRequest({
      sessionId,
      payeeEmail,
    });
  } catch (e: unknown) {
    return next(
      new ServerError({
        message: "Could not initiate payment request",
        status: 500,
        cause: e,
      })
    );
  }

  res.json(paymentRequest);
}

export function validateSessionIsEligibleForInviteToPay({
  email,
  session,
}: {
  email: string;
  session: Session;
}): boolean {
  // TODO
  // validate breadcrumbs
  // - includes Pay
  // - payee email
  // - flow is complete (session is locked)
  return !!email && !!session;
}

function isValidIdFormat(id: string): boolean {
  return validateUUID(id) && getUUIDVersion(id) === 4;
}
