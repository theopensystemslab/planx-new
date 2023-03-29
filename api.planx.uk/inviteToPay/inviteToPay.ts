import { NextFunction, Request, Response } from "express";
import type {
  Session,
  PaymentRequest,
  KeyPath,
} from "@opensystemslab/planx-core";

import { ServerError } from "../errors";
import { _admin } from "../client";

const defaultSessionPreviewKeys: Array<KeyPath> = [
  ["address", "title"],
  ["applicant.agent.name.first"],
  ["applicant.agent.name.last"],
];

export async function inviteToPay(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.params.sessionId;
  const {
    payeeEmail,
    agentName,
    sessionPreviewKeys = defaultSessionPreviewKeys,
  }: {
    payeeEmail: string;
    agentName: string;
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

  if (!agentName) {
    return next(
      new ServerError({
        message: "JSON body must contain agentName",
        status: 400,
      })
    );
  }

  let session: Session | undefined;
  try {
    session = await _admin.getSessionById(sessionId);
  } catch (e) {
    console.log(e);
    session = undefined;
  }
  if (!session) {
    return next(
      new ServerError({
        message: "session not found",
        status: 404,
      })
    );
  }

  let paymentRequest: PaymentRequest | undefined;
  try {
    // make session read-only before creating a payment request
    const locked: boolean = await _admin.lockSession(sessionId);
    if (locked) {
      paymentRequest = await _admin.createPaymentRequest({
        sessionId,
        agentName,
        payeeEmail,
        sessionPreviewKeys,
      });
    } else {
      throw new Error("Session was not locked");
    }
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
