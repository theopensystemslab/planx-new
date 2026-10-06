import type {
  GovUKPayment,
  PaymentRequest,
} from "@opensystemslab/planx-core/types";
import assert from "assert";
import type { Request } from "express";
import { responseInterceptor } from "http-proxy-middleware";

import { $api } from "../../client/index.js";
import { ServerError } from "../../errors/index.js";
import { handleGovPayErrors, logPaymentStatus } from "./helpers.js";
import { usePayProxy } from "./proxy.js";
import { isSessionOwnedByApplicant } from "./service/inviteToPay/isSessionOwnedByApplicant.js";
import {
  addGovPayPaymentIdToPaymentRequest,
  postPaymentNotificationToSlack,
} from "./service/utils.js";
import type {
  InviteToPayController,
  PaymentProxyController,
  PaymentRequestProxyController,
} from "./types.js";

assert(process.env.SLACK_WEBHOOK_URL);

// exposed as /pay/:localAuthority and also used as middleware
// returns the url to make a gov uk payment
export const makePaymentViaProxy: PaymentProxyController = async (
  req,
  res,
  next,
) => {
  const { flowId, sessionId } = res.locals.parsedReq.query;
  const teamSlug = res.locals.parsedReq.params.localAuthority;

  const session = await $api.session.findDetails(sessionId);

  if (session?.lockedAt) {
    return next(
      new ServerError({
        message: `Cannot initialise a new payment for locked session ${sessionId}`,
        status: 400,
      }),
    );
  }

  // drop req.params.localAuthority from the path when redirecting
  // so redirects to plain [GOV_UK_PAY_URL] with correct bearer token
  usePayProxy(
    {
      pathRewrite: (path) => path.replace(/^\/pay.*$/, ""),
      selfHandleResponse: true,
      on: {
        proxyRes: responseInterceptor(
          async (responseBuffer, _proxyRes, _req, { statusCode }) => {
            const responseString = responseBuffer.toString("utf8");
            const govUkResponse = JSON.parse(responseString);

            if (statusCode >= 400) return handleGovPayErrors(govUkResponse);

            await logPaymentStatus({
              sessionId,
              flowId,
              teamSlug,
              govUkResponse,
            });
            return responseBuffer;
          },
        ),
      },
    },
    req,
    res,
  )(req, res, next);
};

export const makeInviteToPayPaymentViaProxy: PaymentRequestProxyController = (
  req,
  res,
  next,
) => {
  const { flowId, sessionId } = res.locals.parsedReq.query;
  const { localAuthority: teamSlug, paymentRequest: paymentRequestId } =
    res.locals.parsedReq.params;

  // drop req.params.localAuthority from the path when redirecting
  // so redirects to plain [GOV_UK_PAY_URL] with correct bearer token
  usePayProxy(
    {
      pathRewrite: (path) => path.replace(/^\/pay.*$/, ""),
      selfHandleResponse: true,
      on: {
        proxyRes: responseInterceptor(
          async (responseBuffer, _proxyRes, _req, { statusCode }) => {
            const responseString = responseBuffer.toString("utf8");
            const govUkResponse = JSON.parse(responseString);

            if (statusCode >= 400) return handleGovPayErrors(govUkResponse);

            await logPaymentStatus({
              sessionId,
              flowId,
              teamSlug,
              govUkResponse,
            });

            try {
              await addGovPayPaymentIdToPaymentRequest(
                paymentRequestId,
                govUkResponse,
              );
            } catch (error) {
              throw Error(error as string);
            }

            return responseBuffer;
          },
        ),
      },
    },
    req,
    res,
  )(req, res, next);
};

// exposed as /pay/:localAuthority/:paymentId and also used as middleware
// fetches the status of the payment
export const fetchPaymentViaProxy = fetchPaymentViaProxyWithCallback(
  async (req: Request, govUkPayment: GovUKPayment) =>
    postPaymentNotificationToSlack(req, govUkPayment),
);

export function fetchPaymentViaProxyWithCallback(
  callback: (req: Request, govUkPayment: GovUKPayment) => Promise<void>,
): PaymentProxyController {
  return async (req, res, next) => {
    const { flowId, sessionId } = res.locals.parsedReq.query;
    const teamSlug = res.locals.parsedReq.params.localAuthority;

    // will redirect to [GOV_UK_PAY_URL]/:paymentId with correct bearer token
    usePayProxy(
      {
        pathRewrite: () => `/${req.params.paymentId}`,
        selfHandleResponse: true,
        on: {
          proxyRes: responseInterceptor(
            async (responseBuffer, _proxyRes, _req, { statusCode }) => {
              const govUkResponse = JSON.parse(responseBuffer.toString("utf8"));

              if (statusCode >= 400) return handleGovPayErrors(govUkResponse);

              await logPaymentStatus({
                sessionId,
                flowId,
                teamSlug,
                govUkResponse,
              });

              try {
                await callback(req, govUkResponse);
              } catch (e) {
                throw Error(e as string);
              }

              // only return payment status, filter out PII
              return JSON.stringify({
                payment_id: govUkResponse.payment_id,
                amount: govUkResponse.amount,
                state: govUkResponse.state,
                _links: {
                  next_url: govUkResponse._links?.next_url,
                },
              });
            },
          ),
        },
      },
      req,
      res,
    )(req, res, next);
  };
}

export const inviteToPay: InviteToPayController = async (_req, res, next) => {
  const { sessionId } = res.locals.parsedReq.params;
  const { email, payeeEmail, payeeName, applicantName, sessionPreviewKeys } =
    res.locals.parsedReq.body;

  // Only the applicant who saved the session can invite a nominee to pay for it
  const canLock = await isSessionOwnedByApplicant({ sessionId, email });
  if (!canLock) {
    return next(
      new ServerError({
        message: "Session not found",
        status: 404,
      }),
    );
  }

  // Lock session before creating a payment request
  const locked = await $api.session.lock(sessionId);

  // We know the session exists, so null means it's already locked
  if (locked === null) {
    return next(
      new ServerError({
        message: "Session is already locked",
        status: 409,
      }),
    );
  }
  if (locked === false) {
    return next(
      new ServerError({
        message: "Could not initiate a payment request: failed to lock session",
        status: 500,
      }),
    );
  }

  let paymentRequest: PaymentRequest | undefined;
  try {
    paymentRequest = await $api.paymentRequest.create({
      sessionId,
      applicantName,
      payeeName,
      payeeEmail,
      sessionPreviewKeys,
    });
  } catch (e: unknown) {
    // revert the session lock on failure
    await $api.session.unlock(sessionId);
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
};
