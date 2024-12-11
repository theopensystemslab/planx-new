import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface GetMetabaseId {
  teams: {
    id: number;
    name: string;
    metabaseId: number | null;
  }[];
}

export const getTeamIdAndMetabaseId = async (name: string) => {
  try {
    const response = await $api.client.request<GetMetabaseId>(
      gql`
        query GetTeamAndMetabaseId($name: String!) {
          teams(where: { name: { _ilike: $name } }) {
            id
            name
            metabaseId: metabase_id
          }
        }
      `,
      {
        name: name,
      },
    );

    const result = response.teams[0];
    return result;
  } catch (e) {
    console.error(
      "Error fetching team's ID / Metabase ID from PlanX DB:",
      (e as Error).stack,
    );
    throw e;
  }
};
