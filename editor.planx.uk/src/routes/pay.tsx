import gql from "graphql-tag";
import { client } from "lib/graphql";
import { compose, mount, NaviRequest, NotFoundError, route } from "navi";
import InviteToPay from "pages/Pay/InviteToPay";
import MakePayment from "pages/Pay/MakePayment";
import { PaymentRequest } from "pages/Pay/types";
import React from "react";

import { makeTitle } from "./utils";

const payRoutes = compose(
  mount({
    "/": route(async (req) => {
      const paymentRequest = await getPaymentRequest(req);
      return {
        title: makeTitle("Make a payment"),
        view: <MakePayment {...paymentRequest} />,
      };
    }),
    "/invite": route(async (req) => {
      const paymentRequest = await getPaymentRequest(req);
      return {
        title: makeTitle("Invite to pay"),
        view: <InviteToPay {...paymentRequest} />,
      };
    }),
  })
);

const getPaymentRequest = async (req: NaviRequest) => {
  const paymentRequestId = req.params["payment-request-id"];
  if (!paymentRequestId) throw new NotFoundError(req.originalUrl);
  const data: PaymentRequest = await fetchPaymentRequest(paymentRequestId);
  if (!data) throw new NotFoundError(req.originalUrl);
  return data;
};

const fetchPaymentRequest = async (paymentRequestId: string) => {
  try {
    const {
      data: { payment_requests_by_pk: paymentRequest },
    } = await client.query({
      query: gql`
        query GetAllPaymentRequests($id: uuid!) {
          payment_requests_by_pk(payment_request_id: $id) {
            sessionPreviewData: session_preview_data
            paymentRequestId: payment_request_id
            createdAt: created_at
          }
        }
      `,
      variables: {
        id: paymentRequestId,
      },
    });
    return paymentRequest;
  } catch (error) {
    console.error(error);
  }
};

export default payRoutes;
