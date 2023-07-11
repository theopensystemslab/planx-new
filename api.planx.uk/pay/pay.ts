import assert from "assert";
import { NextFunction, Request, Response } from "express";
import { responseInterceptor } from "http-proxy-middleware";
import SlackNotify from "slack-notify";
import { logPaymentStatus } from "../send/helpers";
import { usePayProxy } from "./proxy";
import { addGovPayPaymentIdToPaymentRequest } from "../inviteToPay";
import { $admin } from "../client";
import { ServerError } from "../errors";
import { GovUKPayment } from "@opensystemslab/planx-core/types";

assert(process.env.SLACK_WEBHOOK_URL);

// exposed as /pay/:localAuthority and also used as middleware
// returns the url to make a gov uk payment
export async function makePaymentViaProxy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // confirm that this local authority (aka team) has a pay token configured before creating the proxy
  const isSupported =
    process.env[`GOV_UK_PAY_TOKEN_${req.params.localAuthority.toUpperCase()}`];

  if (!isSupported) {
    return next(
      new ServerError({
        message: "GOV.UK Pay is not enabled for this local authority",
        status: 400,
      }),
    );
  }

  const flowId = req.query?.flowId as string | undefined;
  const sessionId = req.query?.sessionId as string | undefined;
  const teamSlug = req.params.localAuthority;

  if (!flowId || !sessionId || !teamSlug) {
    return next(
      new ServerError({
        message: "Missing required query param",
        status: 400,
      }),
    );
  }

  const session = await $admin.session.findDetails(sessionId);

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
  )(req, res, next);
}

export async function makeInviteToPayPaymentViaProxy(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // confirm that this local authority (aka team) has a pay token configured before creating the proxy
  const isSupported =
    process.env[`GOV_UK_PAY_TOKEN_${req.params.localAuthority.toUpperCase()}`];

  if (!isSupported) {
    return next({
      status: 400,
      message: `GOV.UK Pay is not enabled for this local authority`,
    });
  }

  const flowId = req.query?.flowId as string | undefined;
  const sessionId = req.query?.sessionId as string | undefined;
  const paymentRequestId = req.params?.paymentRequest as string;
  const teamSlug = req.params.localAuthority;

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
  )(req, res, next);
}

// exposed as /pay/:localAuthority/:paymentId and also used as middleware
// fetches the status of the payment
export const fetchPaymentViaProxy = fetchPaymentViaProxyWithCallback(
  async (req: Request, govUkPayment: GovUKPayment) =>
    postPaymentNotificationToSlack(req, govUkPayment),
);

export function fetchPaymentViaProxyWithCallback(
  callback: (req: Request, govUkPayment: GovUKPayment) => Promise<void>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const flowId = req.query?.flowId as string | undefined;
    const sessionId = req.query?.sessionId as string | undefined;
    const teamSlug = req.params.localAuthority;

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
    )(req, res, next);
  };
}

export async function postPaymentNotificationToSlack(
  req: Request,
  govUkResponse: GovUKPayment,
  label = "",
) {
  // if it's a prod payment, notify #planx-notifications so we can monitor for subsequent submissions
  if (govUkResponse?.payment_provider !== "sandbox") {
    const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
    const getStatus = (state: GovUKPayment["state"]) =>
      state.status + (state.message ? ` (${state.message})` : "");
    const payMessage = `:coin: New GOV Pay payment ${label} *${
      govUkResponse.payment_id
    }* with status *${getStatus(govUkResponse.state)}* [${
      req.params.localAuthority
    }]`;
    await slack.send(payMessage);
    console.log("Payment notification posted to Slack");
  }
}
