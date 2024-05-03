import { Role, User } from "@opensystemslab/planx-core/types";
import gql from "graphql-tag";
import { groupBy } from "lodash";
import { compose, mount, route, withData } from "navi";
import {
  TeamMember,
  TeamMembers,
} from "pages/FlowEditor/components/Team/TeamMembers";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { client } from "../lib/graphql";
import { makeTitle } from "./utils";

interface GetUsersForTeam {
  users: User[];
}

const teamMembersRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": route(async () => {
      const teamSlug = useStore.getState().teamSlug;

      const {
        data: { users },
      } = await client.query<GetUsersForTeam>({
        query: gql`
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
              teams(where: { team: { slug: { _eq: $teamSlug } } }) {
                role
              }
            }
          }
        `,
        variables: { teamSlug },
      });

      const teamMembers: TeamMember[] = users.map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
        role: user.isPlatformAdmin ? "platformAdmin" : user.teams[0].role,
      }));

      const teamMembersByRole = groupBy(teamMembers, "role") as Record<
        Role,
        TeamMember[]
      >;

      return {
        title: makeTitle("Team Members"),
        view: <TeamMembers teamMembersByRole={teamMembersByRole} />,
      };
    }),
  }),
);

export default teamMembersRoutes;
