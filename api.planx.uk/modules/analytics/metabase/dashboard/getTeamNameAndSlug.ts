import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface GetTeamNameAndSlug {
  teams: {
    id: number;
    teamName: string;
    teamSlug: string;
  }[];
}

export const getTeamNameAndSlug = async (id: number) => {
  try {
    const response = await $api.client.request<GetTeamNameAndSlug>(
      gql`
        query GetTeamNameAndSlug($id: Int!) {
          teams(where: { id: { _eq: $id } }) {
            id
            teamName: name
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
