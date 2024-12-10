import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface GetMetabaseId {
  teams: {
    id: number;
    name: string;
    metabaseId: number | null;
  }[];
}

export const getTeamAndMetabaseId = async (name: string) => {
  const lowerName = name.toLowerCase();
  console.log("RUNNING getTeamAndMetabaseId...");
  try {
    const response = await $api.client.request<GetMetabaseId>(
      gql`
        query GetTeamAndMetabaseId($name: String!) {
          teams(where: { name: { _eq: $name } }) {
            id
            name
            metabaseId: metabase_id
          }
        }
      `,
      {
        name: lowerName,
      },
    );
    console.log("Raw response:");
    console.log(JSON.stringify(response, null, 2));

    const result = response.teams[0];
    console.log("Processed result:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    console.error(
      "Error fetching team's ID / Metabase ID from PlanX DB:",
      (e as Error).stack,
    );
    throw e;
  }
};
