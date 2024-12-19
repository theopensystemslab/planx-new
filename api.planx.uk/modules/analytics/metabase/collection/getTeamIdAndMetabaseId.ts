import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface GetMetabaseId {
  teams: {
    id: number;
    name: string;
    slug: string;
    metabaseId: number | null;
  }[];
}

export const getTeamIdAndMetabaseId = async (slug: string) => {
  try {
    const response = await $api.client.request<GetMetabaseId>(
      gql`
        query GetTeamAndMetabaseId($slug: String!) {
          teams(where: { slug: { _eq: $slug } }) {
            id
            name
            slug
            metabaseId: metabase_id
          }
        }
      `,
      {
        slug: slug,
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
