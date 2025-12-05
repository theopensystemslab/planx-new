import {
  ComponentType,
  type FlowGraph,
  type Node,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import * as jsondiffpatch from "jsondiffpatch";
import { getClient } from "../../../client/index.js";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers.js";
import { createScheduledEvent } from "../../../lib/hasura/metadata/index.js";
import type { CreateScheduledEventResponse } from "../../../lib/hasura/metadata/types.js";
import { userContext } from "../../auth/middleware.js";
import { buildNodeTypeSet, createFlowTypeMap } from "../validate/helpers.js";

interface PublishFlow {
  publishedFlow: {
    id: string;
    flowId: string;
    publisherId: string;
    createdAt: string;
    data: FlowGraph;
  };
}

export const publishFlow = async (
  flowId: string,
  summary: string,
  templatedFlowIds?: string[],
): Promise<{
  alteredNodes: Node[];
  templatedFlowsScheduledEventsResponse?: CreateScheduledEventResponse[];
} | null> => {
  const userId = userContext.getStore()?.user?.sub;
  if (!userId) throw Error("User details missing from request");

  const flattenedFlow = await dataMerged(flowId);
  const mostRecent = await getMostRecentPublishedFlow(flowId);
  const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

  // If no changes, then nothing to publish nor events to queue up!
  if (!delta) return null;

  const nodeTypeSet = buildNodeTypeSet(flattenedFlow);
  const hasSendComponent = nodeTypeSet.has(ComponentType.Send);
  const hasSections = nodeTypeSet.has(ComponentType.Section);

  const flowTypeMap = createFlowTypeMap(flattenedFlow);
  const hasPayComponent = Array.from(
    flowTypeMap.get(ComponentType.Pay) ?? new Set<string>(),
  ).some((id) => !flattenedFlow[id]?.data?.hidePay);

  const { client: $client } = getClient();
  const response = await $client.request<PublishFlow>(
    gql`
      mutation PublishFlow(
        $data: jsonb = {}
        $flow_id: uuid
        $publisher_id: Int
        $summary: String
        $has_send_component: Boolean
        $has_sections: Boolean
        $has_pay_component: Boolean
      ) {
        publishedFlow: insert_published_flows_one(
          object: {
            data: $data
            flow_id: $flow_id
            publisher_id: $publisher_id
            summary: $summary
            has_send_component: $has_send_component
            has_sections: $has_sections
            has_pay_component: $has_pay_component
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
      summary: summary,
      has_send_component: hasSendComponent,
      has_sections: hasSections,
      has_pay_component: hasPayComponent,
    },
  );

  const publishedFlow = response.publishedFlow && response.publishedFlow.data;

  const alteredNodes: Node[] = Object.keys(delta).map((key) => ({
    id: key,
    ...publishedFlow[key],
  }));

  // If we're publishing a source flow, queue up events to additionally update each of its' templated flows
  let templatedFlowsScheduledEventsResponse:
    | CreateScheduledEventResponse[]
    | undefined;
  if (templatedFlowIds && templatedFlowIds?.length > 0) {
    templatedFlowsScheduledEventsResponse = await Promise.all(
      templatedFlowIds.map((templatedFlowId, i) =>
        createScheduledEvent({
          webhook: `{{HASURA_PLANX_API_URL}}/flows/${flowId}/update-templated-flow/${templatedFlowId}`,
          schedule_at: new Date(
            new Date().getTime() + (i > 0 ? i * 10 : 0) * 1000,
          ), // Stagger events by 10 seconds starting at "now"
          payload: {
            sourceFlowId: flowId,
            templatedFlowId: templatedFlowId,
          },
          comment: `update_templated_flow_${templatedFlowId}`,
        }),
      ),
    );
  }

  return { alteredNodes, templatedFlowsScheduledEventsResponse };
};
