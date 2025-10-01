import {
  Team,
  TeamSettings,
  TeamTheme,
} from "@opensystemslab/planx-core/types";
import { createFileRoute } from "@tanstack/react-router";
import gql from "graphql-tag";
import { useStore } from "pages/FlowEditor/lib/store";
import Teams from "pages/Teams";
import React from "react";

import { client } from "../../lib/graphql";

export type TeamSummary = Pick<Team, "id" | "name" | "slug"> & {
  settings: Pick<TeamSettings, "isTrial">;
} & { theme: Pick<TeamTheme, "primaryColour" | "logo"> };

export const Route = createFileRoute("/_authenticated/")({
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
