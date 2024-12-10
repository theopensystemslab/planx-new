import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface UpdateMetabaseId {
  teams: {
    id: number;
    name: string;
    metabaseId: number;
  };
}

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
              name
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
    console.log({ response });
    return response;
  } catch (e) {
    console.error(
      "There's been an error while updating the Metabase ID for this team",
      (e as Error).stack,
    );
    throw e;
  }
};
