import app from "./init";
import assert from "assert";
import {
  createProxyMiddleware,
  responseInterceptor,
  Options,
  fixRequestBody,
} from "http-proxy-middleware";
import { Request } from "express-jwt";
import SlackNotify from "slack-notify";
import { useProxy } from "../proxy";
import { sendToUniform } from "../send/uniform";
import { sendToBOPS } from "../send/bops";
import { createSendEvents } from "../send/createSendEvents";

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
app.post("/create-send-events/:sessionId", createSendEvents);

assert(process.env.HASURA_PLANX_API_KEY);

assert(process.env.BOPS_API_ROOT_DOMAIN);
assert(process.env.BOPS_API_TOKEN);
app.post("/bops/:localAuthority", useHasuraAuth, sendToBOPS);

assert(process.env.UNIFORM_TOKEN_URL);
assert(process.env.UNIFORM_SUBMISSION_URL);
app.post("/uniform/:localAuthority", useHasuraAuth, sendToUniform);

["BUCKINGHAMSHIRE", "LAMBETH", "SOUTHWARK"].forEach((authority) => {
  assert(process.env[`GOV_UK_PAY_TOKEN_${authority}`]);
});

// used by startNewPayment() in @planx/components/Pay/Public/Pay.tsx
// returns the url to make a gov uk payment
app.post("/pay/:localAuthority", (req, res, next) => {
  // confirm that this local authority (aka team) has a pay token configured before creating the proxy
  const isSupported =
    process.env[`GOV_UK_PAY_TOKEN_${req.params.localAuthority.toUpperCase()}`];

  if (isSupported) {
    // drop req.params.localAuthority from the path when redirecting
    // so redirects to plain [GOV_UK_PAY_URL] with correct bearer token
    usePayProxy(
      {
        pathRewrite: (path) => path.replace(/^\/pay.*$/, ""),
      },
      req
    )(req, res, next);
  } else {
    next({
      status: 400,
      message: `GOV.UK Pay is not enabled for this local authority`,
    });
  }
});

assert(process.env.SLACK_WEBHOOK_URL);

// used by refetchPayment() in @planx/components/Pay/Public/Pay.tsx
// fetches the status of the payment
app.get("/pay/:localAuthority/:paymentId", (req, res, next) => {
  // will redirect to [GOV_UK_PAY_URL]/:paymentId with correct bearer token
  usePayProxy(
    {
      pathRewrite: () => `/${req.params.paymentId}`,
      selfHandleResponse: true,
      onProxyRes: responseInterceptor(async (responseBuffer) => {
        const govUkResponse = JSON.parse(responseBuffer.toString("utf8"));

        // if it's a prod payment, notify #planx-notifcations so we can monitor for subsequent submissions
        if (govUkResponse?.payment_provider !== "sandbox") {
          try {
            const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
            const payMessage = `:coin: New GOV Pay payment *${govUkResponse.payment_id}* with status *${govUkResponse.state.status}* [${req.params.localAuthority}]`;
            await slack.send(payMessage);
            console.log("Payment notification posted to Slack");
          } catch (error) {
            next(error);
            return "";
          }
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
});

function usePayProxy(options: Partial<Options>, req: Request) {
  return useProxy({
    target: "https://publicapi.payments.service.gov.uk/v1/payments",
    onProxyReq: fixRequestBody,
    headers: {
      ...(req.headers as NodeJS.Dict<string | string[]>),
      Authorization: `Bearer ${
        process.env[
          `GOV_UK_PAY_TOKEN_${req.params.localAuthority}`.toUpperCase()
        ]
      }`,
    },
    ...options,
  });
}

export default app;
