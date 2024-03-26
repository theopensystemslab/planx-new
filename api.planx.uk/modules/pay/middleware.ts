import { NextFunction, Request, RequestHandler, Response } from "express";
import { gql } from "graphql-request";
import { $api } from "../../client";
import { ServerError } from "../../errors";
import { GovPayMetadata } from "./types";

/**
 * Confirm that this local authority (aka team) has a pay token
 */
export const isTeamUsingGovPay: RequestHandler = async (req, res, next) => {
  const env =
    process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

  const { govPayToken } = await $api.team.getIntegrations({
    env,
    slug: req.params.localAuthority,
    encryptionKey: process.env.ENCRYPTION_KEY!,
  });

  if (!govPayToken) {
    return next({
      status: 400,
      message: `GOV.UK Pay is not enabled for this local authority (${req.params.localAuthority})`,
    });
  }

  res.locals.govPayToken = govPayToken;

  next();
};

interface GetPaymentRequestDetails {
  paymentRequest: {
    sessionId: string;
    paymentAmount: number;
    govPayMetadata: GovPayMetadata[];
    session: {
      flowId: string;
      flow: {
        team: {
          slug: string;
        };
      };
    };
  } | null;
}

export async function fetchPaymentRequestDetails(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const query = gql`
    query GetPaymentRequestDetails($paymentRequestId: uuid!) {
      paymentRequest: payment_requests_by_pk(id: $paymentRequestId) {
        sessionId: session_id
        paymentAmount: payment_amount
        govPayMetadata: govpay_metadata
        session {
          flowId: flow_id
          flow {
            team {
              slug
            }
          }
        }
      }
    }
  `;
  const { paymentRequest } =
    await $api.client.request<GetPaymentRequestDetails>(query, {
      paymentRequestId: req.params.paymentRequest,
    });
  if (!paymentRequest) {
    return next(
      new ServerError({
        message: "payment request not found",
        status: 404,
      }),
    );
  }
  const sessionId = paymentRequest.sessionId;
  if (sessionId) req.query.sessionId = sessionId;

  const localAuthority = paymentRequest.session?.flow?.team?.slug;
  if (localAuthority) req.params.localAuthority = localAuthority;

  const flowId = paymentRequest.session?.flowId;
  if (flowId) req.query.flowId = flowId;

  const paymentAmount = paymentRequest.paymentAmount.toString();
  if (paymentAmount) req.params.paymentAmount = paymentAmount;

  res.locals.govPayMetadata = paymentRequest.govPayMetadata;

  next();
}

// https://docs.payments.service.gov.uk/api_reference/create_a_payment_reference/#json-body-parameters-for-39-create-a-payment-39
interface GovPayCreatePayment {
  amount: number;
  reference: string;
  description: string;
  return_url: string;
  metadata: Record<string, string | boolean>;
}

export async function buildPaymentPayload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.query.returnURL) {
    return next(
      new ServerError({
        message: "Missing required returnURL query param",
        status: 400,
      }),
    );
  }

  if (!req.query.sessionId) {
    return next(
      new ServerError({
        message: "Missing required sessionId query param",
        status: 400,
      }),
    );
  }

  // Convert metadata to format required by GovPay
  const govPayMetadata = Object.fromEntries(
    res.locals.govPayMetadata.map(({ key, value }: GovPayMetadata) => [
      key,
      value,
    ]),
  );

  const defaultGovPayMetadata = {
    source: "PlanX",
    // Payment requests have /pay path suffix, so get flow-slug from second-to-last position
    flow:
      (req.query.returnURL as string)
        .split("?")?.[0]
        ?.split("/")
        ?.slice(-2, -1)?.[0] || "Could not parse service name",
    inviteToPay: true,
  };

  const metadata = Object.keys(govPayMetadata).length
    ? govPayMetadata
    : defaultGovPayMetadata;

  const createPaymentBody: GovPayCreatePayment = {
    amount: parseInt(req.params.paymentAmount),
    reference: req.query.sessionId as string,
    description: "New application (nominated payee)",
    return_url: req.query.returnURL as string,
    metadata,
  };

  req.body = createPaymentBody;

  next();
}
