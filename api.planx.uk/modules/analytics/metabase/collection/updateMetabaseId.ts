import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface UpdateMetabaseId {
  teams: {
    id: number;
    slug: string;
    metabaseId: number;
  };
}

/** Updates column `metabase_id` in the Planx DB `teams` table */
export const updateMetabaseId = async (teamId: number, metabaseId: number) => {
  try {
    const response = await $api.client.request<UpdateMetabaseId>(
      gql`
        mutation UpdateTeamMetabaseId($id: Int!, $metabaseId: Int!) {
          update_teams(
            where: { id: { _eq: $id } }
            _set: { metabase_id: $metabaseId }
          ) {
            returning {
              id
              slug
              metabase_id
            }
          }
        }
      `,
      {
        id: teamId,
        metabaseId: metabaseId,
      },
    );
    return response;
  } catch (e) {
    console.error(
      "There's been an error while updating the Metabase ID for this team",
      (e as Error).stack,
    );
    throw e;
  }
};
