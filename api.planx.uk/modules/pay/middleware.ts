import { NextFunction, Request, RequestHandler, Response } from "express";
import { gql } from "graphql-request";
import { $api } from "../../client";
import { ServerError } from "../../errors";

/**
 * Confirm that this local authority (aka team) has a pay token
 * TODO: Check this against a DB value instead of env vars?
 */
export const isTeamUsingGovPay: RequestHandler = (req, _res, next) => {
  const isSupported =
    process.env[`GOV_UK_PAY_TOKEN_${req.params.localAuthority.toUpperCase()}`];

  if (!isSupported) {
    return next({
      status: 400,
      message: `GOV.UK Pay is not enabled for this local authority (${req.params.localAuthority})`,
    });
  }

  next();
};

interface GetPaymentRequestDetails {
  paymentRequest: {
    sessionId: string;
    paymentAmount: number;
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
  _res: Response,
  next: NextFunction,
) {
  const query = gql`
    query GetPaymentRequestDetails($paymentRequestId: uuid!) {
      paymentRequest: payment_requests_by_pk(id: $paymentRequestId) {
        sessionId: session_id
        paymentAmount: payment_amount
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

  next();
}

// https://docs.payments.service.gov.uk/api_reference/create_a_payment_reference/#json-body-parameters-for-39-create-a-payment-39
interface GovPayCreatePayment {
  amount: number;
  reference: string;
  description: string;
  return_url: string;
  metadata?: {
    source: "PlanX";
    flow: string;
    inviteToPay: boolean;
  };
}

export async function buildPaymentPayload(
  req: Request,
  _res: Response,
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

  const createPaymentBody: GovPayCreatePayment = {
    amount: parseInt(req.params.paymentAmount),
    reference: req.query.sessionId as string,
    description: "New application (nominated payee)",
    return_url: req.query.returnURL as string,
    metadata: {
      source: "PlanX",
      flow:
        req.query.returnURL.toString().split("?")?.[0]?.split("/").pop() ||
        (req.query.returnURL as string),
      inviteToPay: true,
    },
  };

  req.body = createPaymentBody;

  next();
}
