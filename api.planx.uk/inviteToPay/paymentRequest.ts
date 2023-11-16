import { gql } from "graphql-request";
import { NextFunction, Request, Response } from "express";
import { ServerError } from "../errors";
import { fetchPaymentViaProxyWithCallback } from "../modules/pay/controller";
import { GovUKPayment } from "@opensystemslab/planx-core/types";
import { $api } from "../client";
import { postPaymentNotificationToSlack } from "../modules/pay/service";

// https://docs.payments.service.gov.uk/api_reference/create_a_payment_reference/#json-body-parameters-for-39-create-a-payment-39
interface GovPayCreatePayment {
  amount: number;
  reference: string;
  description: string;
  return_url: string;
}

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

// middleware used by routes:
//  * /payment-request/:paymentRequest/pay
//  * /payment-request/:paymentRequest/payment/:paymentId
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

// middleware used by /payment-request/:paymentRequest/pay?returnURL=...
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
  };

  req.body = createPaymentBody;

  next();
}

export const fetchPaymentRequestViaProxy = fetchPaymentViaProxyWithCallback(
  async (req: Request, govUkResponse: GovUKPayment) => {
    const paymentRequestId = req.params.paymentRequest;
    if (paymentRequestId && govUkResponse?.state.status === "success") {
      await markPaymentRequestAsPaid(paymentRequestId, govUkResponse);
    }
    await postPaymentNotificationToSlack(req, govUkResponse, "(invite to pay)");
  },
);

interface MarkPaymentRequestAsPaid {
  updatePaymentRequestPaidAt: {
    affectedRows: number;
  };
  appendGovUKPaymentToSessionData: {
    affectedRows: number;
  };
}

export const markPaymentRequestAsPaid = async (
  paymentRequestId: string,
  govUkPayment: GovUKPayment,
) => {
  const query = gql`
    mutation MarkPaymentRequestAsPaid(
      $paymentRequestId: uuid!
      $govUkPayment: jsonb
    ) {
      updatePaymentRequestPaidAt: update_payment_requests(
        where: {
          _and: { id: { _eq: $paymentRequestId }, paid_at: { _is_null: true } }
        }
        _set: { paid_at: "now()" }
      ) {
        affectedRows: affected_rows
      }

      # This will also overwrite any abandoned payments attempted on the session
      appendGovUKPaymentToSessionData: update_lowcal_sessions(
        _append: { data: $govUkPayment }
        where: { payment_requests: { id: { _eq: $paymentRequestId } } }
      ) {
        affectedRows: affected_rows
      }
    }
  `;
  try {
    const { updatePaymentRequestPaidAt, appendGovUKPaymentToSessionData } =
      await $api.client.request<MarkPaymentRequestAsPaid>(query, {
        paymentRequestId,
        govUkPayment: { govUkPayment },
      });
    if (!updatePaymentRequestPaidAt?.affectedRows) {
      throw Error(`payment request ${paymentRequestId} not updated`);
    }
    if (!appendGovUKPaymentToSessionData?.affectedRows) {
      throw Error(
        `session for payment request ${paymentRequestId} not updated`,
      );
    }
  } catch (error) {
    throw Error("Error marking payment request as paid: " + error);
  }
};
