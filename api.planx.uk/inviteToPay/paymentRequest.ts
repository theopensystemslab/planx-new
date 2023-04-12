import { gql } from "graphql-request";
import { NextFunction, Request, Response } from "express";
import { adminGraphQLClient as client } from "../hasura";
import { ServerError } from "../errors";
import {
  postPaymentNotificationToSlack,
  fetchPaymentViaProxyWithCallback,
} from "../pay";
import type { GovUKPayment } from "../types";

// middleware used by routes:
//  * /payment-request/:paymentRequest/pay
//  * /payment-request/:paymentRequest/payment/:paymentId
export async function fetchPaymentRequestDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const query = gql`
    query GetPaymentRequestByID($paymentRequestId: uuid!) {
      payment_requests_by_pk(id: $paymentRequestId) {
        session_id
        payment_amount
        session {
          flow_id
          flow {
            team {
              slug
            }
          }
        }
      }
    }
  `;
  const { payment_requests_by_pk } = await client.request(query, {
    paymentRequestId: req.params.paymentRequest,
  });
  if (!payment_requests_by_pk) {
    return next(
      new ServerError({
        message: "payment request not found",
        status: 404,
      })
    );
  }
  const sessionId = payment_requests_by_pk.session_id;
  if (sessionId) req.query.sessionId = sessionId;

  const localAuthority = payment_requests_by_pk.session?.flow?.team?.slug;
  if (localAuthority) req.params.localAuthority = localAuthority;

  const flowId = payment_requests_by_pk.session?.flow_id;
  if (flowId) req.query.flowId = flowId;

  const paymentAmount = payment_requests_by_pk.payment_amount;
  if (paymentAmount) req.params.paymentAmount = paymentAmount;

  next();
}

// middleware used by /payment-request/:paymentRequest/pay?returnURL=...
export async function buildPaymentPayload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.query.returnURL) {
    return next(
      new ServerError({
        message: "missing required returnURL query param",
        status: 400,
      })
    );
  }
  req.body = {
    amount: req.params.paymentAmount,
    reference: req.query.sessionId,
    description: "New application (nominated payee)",
    return_url: req.query.returnURL,
  };
  next();
}

export const fetchPaymentRequestViaProxy = fetchPaymentViaProxyWithCallback(
  async (req: Request, govUkResponse: GovUKPayment) => {
    const paymentRequestId = req.params.paymentRequest;
    if (paymentRequestId && govUkResponse?.state.status === "success") {
      const query = gql`
        mutation UpdatePaymentRequestPaidAt($paymentRequestId: uuid!) {
          update_payment_requests(
            where: {
              _and: {
                id: { _eq: $paymentRequestId }
                paid_at: { _is_null: true }
              }
            }
            _set: { paid_at: "now()" }
          ) {
            affected_rows
          }
        }
      `;
      const { update_payment_requests } = await client.request(query, {
        paymentRequestId,
      });
      if (!update_payment_requests?.affected_rows) {
        console.log(`payment request ${paymentRequestId} not updated`);
      }
    }
    await postPaymentNotificationToSlack(req, govUkResponse, "(invite to pay)");
  }
);
