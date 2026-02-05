import { createFileRoute, notFound } from "@tanstack/react-router";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { Subscription } from "pages/FlowEditor/components/Subscription/Subscription";
import { ServiceCharge } from "pages/FlowEditor/components/Subscription/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/$team/subscription")({
  loader: async ({ params }) => {
    const isAuthorised = useStore.getState().canUserEditTeam(params.team);
    if (!isAuthorised) {
      throw notFound();
    }

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
            where: { team_slug: { _eq: $teamSlug } }
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
      variables: { teamSlug: params.team },
      fetchPolicy: "no-cache",
    });

    return {
      serviceCharges,
    };
  },
  component: SubscriptionRoute,
});

function SubscriptionRoute() {
  const { serviceCharges } = Route.useLoaderData();
  return <Subscription serviceCharges={serviceCharges} />;
}
