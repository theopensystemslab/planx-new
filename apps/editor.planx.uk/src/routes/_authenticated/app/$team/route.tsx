import type { Team } from "@opensystemslab/planx-core/types";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import React, { useEffect } from "react";
import { CatchAllComponent } from "routes/$";

import { useStore } from "../../../../pages/FlowEditor/lib/store";

export const Route = createFileRoute("/_authenticated/app/$team")({
  pendingComponent: RouteLoadingIndicator,
  beforeLoad: async ({ params }) => {
    const { data } = await client.query<{ teams: Team[] }>({
      query: gql`
        query GetTeamBySlug($slug: String!) {
          teams(
            order_by: { name: asc }
            limit: 1
            where: { slug: { _eq: $slug } }
          ) {
            id
            name
            slug
            domain
            flows(order_by: { updated_at: desc }) {
              slug
              updated_at
              operations(limit: 1, order_by: { id: desc }) {
                actor {
                  first_name
                  last_name
                }
              }
            }
            integrations {
              hasPlanningData: has_planning_data
            }
            settings: team_settings {
              id
              boundaryUrl: boundary_url
              boundaryBBox: boundary_bbox
              referenceCode: reference_code
              helpEmail: help_email
              helpPhone: help_phone
              helpOpeningHours: help_opening_hours
              emailReplyToId: email_reply_to_id
              homepage: homepage
              externalPlanningSiteName: external_planning_site_name
              externalPlanningSiteUrl: external_planning_site_url
              submissionEmail: submission_email
              isTrial: is_trial
            }
          }
        }
      `,
      variables: { slug: params.team },
    });

    const team = data.teams[0];

    if (!team) {
      throw notFound();
    }

    return { team };
  },
  loader: ({ context }) => {
    return context.team;
  },
  component: TeamLayout,
  notFoundComponent: CatchAllComponent,
});

function TeamLayout() {
  const teamData = Route.useLoaderData();
  const setTeam = useStore((state) => state.setTeam);

  useEffect(() => {
    if (!teamData) return;

    setTeam(teamData);
  }, [teamData, setTeam]);

  return <Outlet />;
}
