import { User } from "@opensystemslab/planx-core/types";
import { createFileRoute, notFound } from "@tanstack/react-router";
import gql from "graphql-tag";
import { client } from "lib/graphql";
import { TeamMembers } from "pages/FlowEditor/components/Team/TeamMembers";
import { TeamMember } from "pages/FlowEditor/components/Team/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export interface GetUsersForTeam {
  users: User[];
}

export const GET_USERS_FOR_TEAM_QUERY = gql`
  query GetUsersForTeam($teamSlug: String!) {
    users(
      where: {
        _or: [
          { is_platform_admin: { _eq: true } }
          { teams: { team: { slug: { _eq: $teamSlug } } } }
        ]
      }
      order_by: { first_name: asc }
    ) {
      id
      firstName: first_name
      lastName: last_name
      isPlatformAdmin: is_platform_admin
      email
      defaultTeamId: default_team_id
      teams(where: { team: { slug: { _eq: $teamSlug } } }) {
        role
      }
    }
  }
`;

export const Route = createFileRoute("/_authenticated/app/$team/members")({
  loader: async ({ params }) => {
    const isAuthorised = useStore.getState().canUserEditTeam(params.team);
    if (!isAuthorised) {
      throw notFound();
    }

    const teamSlug = useStore.getState().teamSlug;
    const {
      data: { users },
    } = await client.query<GetUsersForTeam>({
      query: GET_USERS_FOR_TEAM_QUERY,
      variables: { teamSlug },
      fetchPolicy: "no-cache",
    });

    const teamMembers: TeamMember[] = users.map((user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      id: user.id,
      role: user.isPlatformAdmin ? "platformAdmin" : user.teams[0].role,
      defaultTeamId: user.defaultTeamId,
    }));
    return teamMembers;
  },
  component: TeamMemberRoute,
});

function TeamMemberRoute() {
  const data = Route.useLoaderData();
  return <TeamMembers teamMembers={data} />;
}
