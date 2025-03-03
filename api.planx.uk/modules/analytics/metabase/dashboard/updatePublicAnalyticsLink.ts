import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface UpdatePublicAnalyticsLink {
  flows: {
    id: string;
    publicLink: string;
  };
}

/** Updates column `analytics_link` in the Planx DB `flows` table */
export const updatePublicAnalyticsLink = async (
  flowId: string,
  publicLink: string,
) => {
  try {
    const response = await $api.client.request<UpdatePublicAnalyticsLink>(
      gql`
        mutation UpdatePublicAnalyticsLink($id: uuid!, $publicLink: String!) {
          update_flows(
            where: { id: { _eq: $id } }
            _set: { analytics_link: $publicLink }
          ) {
            affected_rows
          }
        }
      `,
      {
        id: flowId,
        publicLink: publicLink,
      },
    );
    return response;
  } catch (e) {
    console.error(
      "There's been an error while updating the analytics link for this flow",
      (e as Error).stack,
    );
    throw e;
  }
};
