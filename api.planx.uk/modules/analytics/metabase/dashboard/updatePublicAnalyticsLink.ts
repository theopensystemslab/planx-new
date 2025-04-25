import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface UpdatePublicAnalyticsLink {
  flow: {
    id: string;
    publicLink: string;
  };
}

export const updatePublicAnalyticsLink = async (
  flowId: string,
  publicLink: string,
) => {
  try {
    const response = await $api.client.request<UpdatePublicAnalyticsLink>(
      gql`
        mutation UpdatePublicAnalyticsLink($id: uuid!, $publicLink: String!) {
          flow: update_flows_by_pk(
            _set: { analytics_link: $publicLink }
            pk_columns: { id: $id }
          ) {
            id
            analytics_link
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
