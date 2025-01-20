import * as jsondiffpatch from "jsondiffpatch";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers.js";
import { gql } from "graphql-request";
import type { FlowGraph, Node } from "@opensystemslab/planx-core/types";
import { userContext } from "../../auth/middleware.js";
import { getClient } from "../../../client/index.js";
import { checkStatutoryApplicationTypes } from "../validate/service/applicationTypes.js";

interface PublishFlow {
  publishedFlow: {
    id: string;
    flowId: string;
    publisherId: string;
    createdAt: string;
    data: FlowGraph;
  };
}

export const publishFlow = async (flowId: string, summary?: string) => {
  const userId = userContext.getStore()?.user?.sub;
  if (!userId) throw Error("User details missing from request");

  const flattenedFlow = await dataMerged(flowId);
  const isStatutoryService = checkStatutoryApplicationTypes(flattenedFlow);
  const mostRecent = await getMostRecentPublishedFlow(flowId);
  const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

  if (!delta) return null;

  const { client: $client } = getClient();
  const response = await $client.request<PublishFlow>(
    gql`
      mutation PublishFlow(
        $data: jsonb = {}
        $flow_id: uuid
        $publisher_id: Int
        $summary: String
        $is_statutory_application_type: Boolean
      ) {
        publishedFlow: insert_published_flows_one(
          object: {
            data: $data
            flow_id: $flow_id
            publisher_id: $publisher_id
            summary: $summary
            is_statutory_application_type: $is_statutory_application_type
          }
        ) {
          id
          flowId: flow_id
          publisherId: publisher_id
          createdAt: created_at
          data
          is_statutory_application_type: is_statutory_application_type
        }
      }
    `,
    {
      data: flattenedFlow,
      flow_id: flowId,
      publisher_id: parseInt(userId),
      summary: summary ?? null,
      is_statutory_application_type: isStatutoryService,
    },
  );

  const publishedFlow = response.publishedFlow && response.publishedFlow.data;

  const alteredNodes: Node[] = Object.keys(delta).map((key) => ({
    id: key,
    ...publishedFlow[key],
  }));

  return alteredNodes;
};
