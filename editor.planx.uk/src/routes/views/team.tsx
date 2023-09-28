import gql from "graphql-tag";
import { client } from "lib/graphql";
import { NaviRequest, NotFoundError } from "navi"
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { View } from "react-navi"
import { getTeamFromDomain } from "routes/utils";

/**
 * View wrapper for /team routes
 * Fetches required data and sets up team store
 */
export const teamView = async (req: NaviRequest) => {
  const slug = req.params.team || await getTeamFromDomain(window.location.hostname)
  const { data } = await client.query({
    query: gql`
      query GetTeams($slug: String!) {
        teams(
          order_by: { name: asc }
          limit: 1
          where: { slug: { _eq: $slug } }
        ) {
          id
          name
          slug
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
        }
      }
    `,
    variables: { slug },
  });

  const team = data.teams[0];

  if (!team) throw new NotFoundError("Team not found");

  useStore.getState().setTeam(team);

  return <View/>
}