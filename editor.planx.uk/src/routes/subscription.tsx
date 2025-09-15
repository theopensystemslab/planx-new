import gql from "graphql-tag";
import { client } from "lib/graphql";
import { compose, mount, NotFoundError, route, withData } from "navi";
import { Subscription } from "pages/FlowEditor/components/Subscription/Subscription";
import { ServiceCharge } from "pages/FlowEditor/components/Subscription/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { makeTitle } from "./utils";

const subscriptionRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": compose(
      route(async (req) => {
        const { team: teamSlug } = req.params;

        const isAuthorised = useStore.getState().canUserEditTeam(teamSlug);
        if (!isAuthorised)
          throw new NotFoundError(
            `User does not have access to ${req.originalUrl}`,
          );

        const {
          data: { serviceCharges },
        } = await client.query<{ serviceCharges: ServiceCharge[] }>({
          query: gql`
            query GetServiceChargesForTeam($teamSlug: String!) {
              serviceCharges: service_charges(
                order_by: {
                  fiscal_year: desc
                  fiscal_year_quarter: desc
                  paid_at: desc
                }
                where: { 
                  team_slug: { _eq: $teamSlug }, 
                  service_charge_amount: { _gt: 0 }}
                }
              ) {
                flowName: flow_name
                sessionId: session_id
                paymentId: payment_id
                amount: service_charge_amount
                paidAt: paid_at
                month
                monthText: month_text
                quarter: fiscal_year_quarter
                fiscalYear: fiscal_year
              }
            }
          `,
          variables: { teamSlug },
        });

        return {
          title: makeTitle([teamSlug, "subscription"].join("/")),
          view: <Subscription serviceCharges={serviceCharges} />,
        };
      }),
    ),
  }),
);

export default subscriptionRoutes;
