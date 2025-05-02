import { gql } from "graphql-request";
import { $api } from "../../../client/index.js";

interface GetTeamSlug {
  teams: {
    id: number;
    teamSlug: string;
  }[];
}

export const getTeamSlug = async (id: number) => {
  try {
    const response = await $api.client.request<GetTeamSlug>(
      gql`
        query GetTeamSlug($id: Int!) {
          teams(where: { id: { _eq: $id } }) {
            id
            teamSlug: slug
          }
        }
      `,
      {
        id,
      },
    );

    const result = response.teams[0];
    return result;
  } catch (e) {
    console.error(
      "Error fetching team name and slug from PlanX DB:",
      (e as Error).stack,
    );
    throw e;
  }
};
