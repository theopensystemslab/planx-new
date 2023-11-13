import * as jsondiffpatch from "jsondiffpatch";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers";
import { gql } from "graphql-request";
import { FlowGraph, Node } from "@opensystemslab/planx-core/types";
import { userContext } from "../../auth/middleware";
import { getClient } from "../../../client";

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
  const mostRecent = await getMostRecentPublishedFlow(flowId);
  const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

  if (!delta) return;

  const { client: $client } = getClient();
  const response = await $client.request<PublishFlow>(
    gql`
      mutation PublishFlow(
        $data: jsonb = {}
        $flow_id: uuid
        $publisher_id: Int
        $summary: String
      ) {
        publishedFlow: insert_published_flows_one(
          object: {
            data: $data
            flow_id: $flow_id
            publisher_id: $publisher_id
            summary: $summary
          }
        ) {
          id
          flowId: flow_id
          publisherId: publisher_id
          createdAt: created_at
          data
        }
      }
    `,
    {
      data: flattenedFlow,
      flow_id: flowId,
      publisher_id: parseInt(userId),
      summary: summary ?? null,
    },
  );

  const publishedFlow = response.publishedFlow && response.publishedFlow.data;

  const alteredNodes: Node[] = Object.keys(delta).map((key) => ({
    id: key,
    ...publishedFlow[key],
  }));

  return alteredNodes;
};
