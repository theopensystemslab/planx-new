import gql from "graphql-tag";
import { client } from "lib/graphql";
import {
  compose,
  mount,
  NaviRequest,
  NotFoundError,
  redirect,
  route,
  withData,
  withView,
} from "navi";
import InviteToPay from "pages/Pay/InviteToPay";
import MakePayment from "pages/Pay/MakePayment";
import { PaymentRequest } from "pages/Pay/types";
import React from "react";

import { getTeamFromDomain, makeTitle, validateTeamRoute } from "./utils";
import standaloneView from "./views/standalone";

const payRoutes = compose(
  withData(async (req) => {
    const externalDomainTeam = await getTeamFromDomain(
      window.location.hostname
    );

    return {
      mountpath: req.mountpath,
      team: req.params.team || externalDomainTeam,
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
    "/pages/:page": redirect(
      (req) => `../../../preview/pages/${req.params.page}`
    ),
    "/invite/pages/:page": redirect(
      (req) => `../../../../preview/pages/${req.params.page}`
    ),
  })
);

const getPaymentRequest = async (req: NaviRequest) => {
  const paymentRequestId = req.params["paymentRequestId"];
  if (!paymentRequestId) throw new NotFoundError(req.originalUrl);
  const data: PaymentRequest = await fetchPaymentRequest(paymentRequestId);
  if (!data) throw new NotFoundError(req.originalUrl);
  return data;
};

const fetchPaymentRequest = async (paymentRequestId: string) => {
  try {
    const {
      data: { paymentRequest },
    } = await client.query({
      query: gql`
        query GetPaymentRequestById($id: uuid!) {
          paymentRequest: payment_requests_by_pk(id: $id) {
            sessionPreviewData: session_preview_data
            paymentRequestId: id
            createdAt: created_at
          }
        }
      `,
      variables: {
        id: paymentRequestId,
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
