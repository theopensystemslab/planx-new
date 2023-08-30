import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { getRetentionPeriod } from "lib/pay";
import {
  compose,
  mount,
  NaviRequest,
  redirect,
  route,
  withData,
  withView,
} from "navi";
import ErrorPage from "pages/ErrorPage";
import InviteToPay from "pages/Pay/InviteToPay";
import MakePayment from "pages/Pay/MakePayment";
import React from "react";

import { getTeamFromDomain, makeTitle, validateTeamRoute } from "./utils";
import standaloneView from "./views/standalone";

const payRoutes = compose(
  withData(async (req) => {
    const externalDomainTeam = await getTeamFromDomain(
      window.location.hostname,
    );

    return {
      mountpath: req.mountpath,
      isPreviewOnlyDomain: Boolean(externalDomainTeam),
    };
  }),

  withView(async (req) => {
    await validateTeamRoute(req);
    return await standaloneView(req);
  }),

  mount({
    "/": route(async (req) => {
      const paymentRequest = await getPaymentRequest(req);
      if (!paymentRequest) {
        return {
          title: makeTitle("Sorry, we can’t find that payment link"),
          view: (
            <ErrorPage title={"Sorry, we can’t find that payment link"}>
              Please check you have the right link. If it still doesn’t work, it
              may mean the payment link has expired or payment has already been
              made.
              <br />
              <br />
              Please contact the person who invited you to pay.
            </ErrorPage>
          ),
        };
      }
      return {
        title: makeTitle("Make a payment"),
        view: <MakePayment {...paymentRequest} />,
      };
    }),
    "/invite": route(async (req) => {
      const paymentRequest = await getPaymentRequest(req);
      if (!paymentRequest) {
        return {
          title: makeTitle("Failed to generate payment request"),
          view: <ErrorPage title={"Failed to generate payment request"} />,
        };
      }
      return {
        title: makeTitle("Invite to pay"),
        view: <InviteToPay {...paymentRequest} />,
      };
    }),
    "/pages/:page": redirect(
      (req) => `../../../preview/pages/${req.params.page}`,
    ),
    "/invite/pages/:page": redirect(
      (req) => `../../../../preview/pages/${req.params.page}`,
    ),
  }),
);

const getPaymentRequest = async (
  req: NaviRequest,
): Promise<PaymentRequest | undefined> => {
  const paymentRequestId = req.params["paymentRequestId"];
  if (paymentRequestId) {
    const paymentRequest = await fetchPaymentRequest(paymentRequestId);
    return paymentRequest;
  }
};

const fetchPaymentRequest = async (paymentRequestId: string) => {
  try {
    const {
      data: {
        paymentRequests: [paymentRequest],
      },
    } = await client.query<{
      paymentRequests: PaymentRequest[];
    }>({
      query: gql`
        query GetPaymentRequestById($id: uuid!, $retentionPeriod: timestamptz) {
          paymentRequests: payment_requests(
            limit: 1
            where: {
              id: { _eq: $id }
              paid_at: { _is_null: true }
              created_at: { _gt: $retentionPeriod }
            }
          ) {
            id
            sessionPreviewData: session_preview_data
            createdAt: created_at
            paymentAmount: payment_amount
            govPayPaymentId: govpay_payment_id
            paidAt: paid_at
          }
        }
      `,
      variables: {
        id: paymentRequestId,
        retentionPeriod: getRetentionPeriod(),
      },
      context: {
        headers: {
          "x-hasura-payment-request-id": paymentRequestId,
        },
      },
    });
    return paymentRequest;
  } catch (error) {
    console.error(error);
  }
};

export default payRoutes;
