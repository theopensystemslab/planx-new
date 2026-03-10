import { createFileRoute } from "@tanstack/react-router";
import gql from "graphql-tag";
import { useStore } from "pages/FlowEditor/lib/store";
import Teams from "pages/Teams";
import React from "react";

import { client } from "../../../lib/graphql";
import { TeamSummary } from "../../../pages/FlowEditor/lib/store/team";

export type { TeamSummary };

export const Route = createFileRoute("/_authenticated/app/")({
  loader: async () => {
    const { data } = await client.query<{ teams: TeamSummary[] }>({
      query: gql`
        query GetTeamSummaries {
          teams(order_by: { name: asc }) {
            id
            name
            slug
            settings: team_settings {
              isTrial: is_trial
            }
            theme {
              primaryColour: primary_colour
              logo
            }
          }
        }
      `,
    });

    useStore.getState().clearTeamStore();

    return {
      teams: data.teams,
    };
  },
  component: AuthenticatedHomeRoute,
});

function AuthenticatedHomeRoute() {
  const data = Route.useLoaderData();
  return (
    <>
      <Teams teams={data.teams} />
    </>
  );
}
