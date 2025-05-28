import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

export const updateTemplatedFlowsOnSourcePublish = async (flowId: string) => {
  const { isTemplate, templatedFlows } =
    await getTemplatedFlowsBySourceId(flowId);
  if (!isTemplate || templatedFlows.length === 0)
    return {
      message: `Skipping update because published flow is not a template or does not have any templatedFlows`,
    };

  // TODO
  // For each templatedFlow, update its' flows.data based on live source flow data (unflattened)

  return {
    message: `TODO - Update ${templatedFlows.length} templatedFlows based on just-published source template ${flowId}`,
  };
};

interface GetTemplatedFlowsBySourceIdResponse {
  isTemplate: boolean;
  templatedFlows:
    | {
        id: string;
        slug: string;
        team: {
          slug: string;
        };
      }[]
    | [];
}

const getTemplatedFlowsBySourceId = async (
  sourceId: string,
): Promise<GetTemplatedFlowsBySourceIdResponse> => {
  const { flow } = await $api.client.request<{
    flow: GetTemplatedFlowsBySourceIdResponse | null;
  }>(
    gql`
      query GetTemplatedFlowsBySourceId($id: uuid!) {
        flow: flows_by_pk(id: $id) {
          isTemplate: is_template
          templatedFlows: templated_flows {
            id
            slug
            team {
              slug
            }
          }
        }
      }
    `,
    {
      id: sourceId,
    },
  );
  if (!flow) throw Error(`Unable to find flow with id ${sourceId}`);

  return flow;
};
