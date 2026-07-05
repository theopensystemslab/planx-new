import { createFileRoute } from "@tanstack/react-router";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import ErrorPage from "pages/ErrorPage/ErrorPage";
import { Subscription } from "pages/FlowEditor/components/Subscription/Subscription";
import type { ServiceCharge } from "pages/FlowEditor/components/Subscription/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const Route = createFileRoute("/_authenticated/app/$team/subscription")({
  loader: async ({ params, context }) => {
    const role = useStore.getState().getUserRoleForCurrentTeam();

    const isAuthorised =
      context.user?.isPlatformAdmin ||
      useStore.getState().getUserRoleForCurrentTeam() === "teamAdmin";

    if (!isAuthorised) {
      throw new Error("The user does not have permission to access this page.");
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
      context: {
        headers: {
          "x-hasura-role": role,
        },
      },
    });

    return {
      serviceCharges,
    };
  },
  errorComponent: ({ error }) => {
    if (
      error?.message?.includes("permission") ||
      error?.message?.includes("access")
    ) {
      return (
        <ErrorPage title="Access denied">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </ErrorPage>
      );
    }
    throw error;
  },
  component: SubscriptionRoute,
});

function SubscriptionRoute() {
  const { serviceCharges } = Route.useLoaderData();
  return <Subscription serviceCharges={serviceCharges} />;
}
