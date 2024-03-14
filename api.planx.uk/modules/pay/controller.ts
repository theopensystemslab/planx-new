import assert from "assert";
import { Request } from "express";
import { responseInterceptor } from "http-proxy-middleware";
import { logPaymentStatus } from "../send/utils/helpers";
import { usePayProxy } from "./proxy";
import { $api } from "../../client";
import { ServerError } from "../../errors";
import { GovUKPayment, PaymentRequest } from "@opensystemslab/planx-core/types";
import {
  addGovPayPaymentIdToPaymentRequest,
  postPaymentNotificationToSlack,
} from "./service/utils";
import {
  InviteToPayController,
  PaymentProxyController,
  PaymentRequestProxyController,
} from "./types";

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
      onProxyRes: responseInterceptor(
        async (responseBuffer, _proxyRes, _req, _res) => {
          const responseString = responseBuffer.toString("utf8");
          const govUkResponse = JSON.parse(responseString);
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
      onProxyRes: responseInterceptor(async (responseBuffer) => {
        const responseString = responseBuffer.toString("utf8");
        const govUkResponse = JSON.parse(responseString);
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
      }),
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
        onProxyRes: responseInterceptor(async (responseBuffer) => {
          const govUkResponse = JSON.parse(responseBuffer.toString("utf8"));

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
        }),
      },
      req,
      res,
    )(req, res, next);
  };
}

export const inviteToPay: InviteToPayController = async (_req, res, next) => {
  const { sessionId } = res.locals.parsedReq.params;
  const { payeeEmail, payeeName, applicantName, sessionPreviewKeys } =
    res.locals.parsedReq.body;
  // lock session before creating a payment request
  const locked = await $api.session.lock(sessionId);
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
