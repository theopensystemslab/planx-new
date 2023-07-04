import { gql } from "graphql-request";
import { NextFunction, Request, Response } from "express";
import { adminGraphQLClient as client } from "../hasura";
import { ServerError } from "../errors";
import {
  postPaymentNotificationToSlack,
  fetchPaymentViaProxyWithCallback,
} from "../pay";
import { GovUKPayment } from "@opensystemslab/planx-core/types";

// middleware used by routes:
//  * /payment-request/:paymentRequest/pay
//  * /payment-request/:paymentRequest/payment/:paymentId
export async function fetchPaymentRequestDetails(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const query = gql`
    query GetPaymentRequestDetails($paymentRequestId: uuid!) {
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
  _res: Response,
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
      await markPaymentRequestAsPaid(paymentRequestId, govUkResponse);
    }
    await postPaymentNotificationToSlack(req, govUkResponse, "(invite to pay)");
  }
);

export const addGovPayPaymentIdToPaymentRequest = async (
  paymentRequestId: string,
  govUKPayment: GovUKPayment,
): Promise<void> => {
  const query = gql`
    mutation AddGovPayPaymentIdToPaymentRequest($paymentRequestId: uuid!, $govPayPaymentId: String) {
      update_payment_requests_by_pk(
        pk_columns: { id: $paymentRequestId }
        _set: { govpay_payment_id: $govPayPaymentId }
       ) {
        id
      }
    }
  `;
  try {
    await client.request(query, {
      paymentRequestId,
      govPayPaymentId: govUKPayment.payment_id,
    });
  } catch (error) {
    throw Error(`payment request ${paymentRequestId} not updated`);
  }
};

export const markPaymentRequestAsPaid = async (paymentRequestId: string, govUkPayment: GovUKPayment) => {
  const query = gql`
    mutation MarkPaymentRequestAsPaid($paymentRequestId: uuid!, $govUkPayment: jsonb) {
      updatePaymentRequestPaidAt: update_payment_requests(
        where: {
          _and: {
            id: { _eq: $paymentRequestId }
            paid_at: { _is_null: true }
          }
        }
        _set: { paid_at: "now()" }
      ) {
        affectedRows: affected_rows
      }

      # This will also overwrite any abandoned payments attempted on the session
      appendGovUKPaymentToSessionData: update_lowcal_sessions(
        _append: { data: $govUkPayment }, 
        where: {
          payment_requests: { id: {_eq: $paymentRequestId} }
        }) {
        affectedRows: affected_rows
      }
    }
  `;
  try {
    const { updatePaymentRequestPaidAt, appendGovUKPaymentToSessionData } = await client.request(query, {
      paymentRequestId,
      govUkPayment: { govUkPayment },
    });
    if (!updatePaymentRequestPaidAt?.affectedRows) {
      throw Error(`payment request ${paymentRequestId} not updated`);
    }
    if (!appendGovUKPaymentToSessionData?.affectedRows) {
      throw Error(`session for payment request ${paymentRequestId} not updated`);
    }
  } catch (error) {
    throw Error("Error marking payment request as paid: " + error)
  };
};