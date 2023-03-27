import camelcaseKeys from "camelcase-keys";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import {
  compose,
  mount,
  NaviRequest,
  NotFoundError,
  route,
  withView,
} from "navi";
import StandalonePage from "pages/layout/Standalone";
import InviteToPay from "pages/Pay/InviteToPay";
import MakePayment from "pages/Pay/MakePayment";
import { PaymentRequest } from "pages/Pay/types";
import React from "react";
import { View } from "react-navi";
import { GlobalSettings, Maybe } from "types";

import { getTeamFromDomain, makeTitle } from "./utils";

const payRoutes = compose(
  withView(async (req) => {
    const flowSlug = req.params.flow.split(",")[0];
    const externalTeamName = await getTeamFromDomain(window.location.hostname);

    // XXX: Prevents accessing a different team than the one associated with the custom domain.
    //      e.g. Custom domain is for Southwark but URL is looking for Lambeth
    //      e.g. https://planningservices.southwark.gov.uk/lambeth/some-flow/preview
    if (
      req.params.team &&
      externalTeamName &&
      externalTeamName !== req.params.team
    )
      throw new NotFoundError();

    const { data } = await client.query({
      query: gql`
        query GetTeamAndSettings($flowSlug: String!, $teamSlug: String!) {
          flows(
            limit: 1
            where: {
              slug: { _eq: $flowSlug }
              team: { slug: { _eq: $teamSlug } }
            }
          ) {
            id
            team {
              theme
              name
              settings
            }
            settings
          }

          global_settings {
            footer_content
          }
        }
      `,
      variables: {
        flowSlug,
        teamSlug: req.params.team || externalTeamName,
      },
    });

    const globalSettings: Maybe<GlobalSettings> = camelcaseKeys(
      data.global_settings[0]
    );

    const team = data.flows[0].team;
    const settings = data.flows[0].settings;
    const footerContent = data.global_settings.footer_content;

    return (
      <StandalonePage
        team={team}
        footerContent={footerContent}
        settings={settings}
      >
        <View />
      </StandalonePage>
    );
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
          global_settings {
            footer_content
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
