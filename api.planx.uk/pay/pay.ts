import assert from "assert";
import { NextFunction, Request, Response } from "express";
import { responseInterceptor } from "http-proxy-middleware";
import SlackNotify from "slack-notify";
import { logPaymentStatus } from "../send/helpers";
import { usePayProxy } from "./proxy";
import type { GovUKPayment } from "../types";

assert(process.env.SLACK_WEBHOOK_URL);

// exposed as /pay/:localAuthority and also used as middleware
// returns the url to make a gov uk payment
export async function makePaymentViaProxy(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // confirm that this local authority (aka team) has a pay token configured before creating the proxy
  const isSupported =
    process.env[`GOV_UK_PAY_TOKEN_${req.params.localAuthority.toUpperCase()}`];

  const flowId = req.query?.flowId as string | undefined;
  const sessionId = req.query?.sessionId as string | undefined;
  const teamSlug = req.params.localAuthority;

  if (isSupported) {
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
          }
        ),
      },
      req
    )(req, res, next);
  } else {
    next({
      status: 400,
      message: `GOV.UK Pay is not enabled for this local authority`,
    });
  }
}

// exposed as /pay/:localAuthority/:paymentId and also used as middleware
// fetches the status of the payment
export const fetchPaymentViaProxy = fetchPaymentViaProxyWithCallback(
  async (req: Request, govUkPayment: GovUKPayment) =>
    postPaymentNotificationToSlack(req, govUkPayment)
);

export function fetchPaymentViaProxyWithCallback(
  callback: (req: Request, govUkPayment: GovUKPayment) => Promise<void>
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
            next(e);
            return "";
          }

          // only return payment status, filter out PII
          return JSON.stringify({
            payment_id: govUkResponse.payment_id,
            amount: govUkResponse.amount,
            state: govUkResponse.state,
          });
        }),
      },
      req
    )(req, res, next);
  };
}

export async function postPaymentNotificationToSlack(
  req: Request,
  govUkResponse: GovUKPayment,
  label = ""
) {
  // if it's a prod payment, notify #planx-notifications so we can monitor for subsequent submissions
  if (govUkResponse?.payment_provider !== "sandbox") {
    const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
    const payMessage = `:coin: New GOV Pay payment ${label} *${govUkResponse.payment_id}* with status *${govUkResponse.state.status}* [${req.params.localAuthority}]`;
    await slack.send(payMessage);
    console.log("Payment notification posted to Slack");
  }
}
