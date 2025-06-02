import * as jsondiffpatch from "jsondiffpatch";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers.js";
import { gql } from "graphql-request";
import {
  ComponentType,
  type FlowGraph,
  type Node,
} from "@opensystemslab/planx-core/types";
import { userContext } from "../../auth/middleware.js";
import { getClient } from "../../../client/index.js";
import { hasComponentType } from "../validate/helpers.js";
import { hasStatutoryApplicationType } from "./helpers.js";
import {
  createScheduledEvent,
  type ScheduledEventResponse,
} from "../../../lib/hasura/metadata/index.js";

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
  templatedFlowsScheduledEventsResponse?: ScheduledEventResponse[];
} | null> => {
  const userId = userContext.getStore()?.user?.sub;
  if (!userId) throw Error("User details missing from request");

  const flattenedFlow = await dataMerged(flowId);
  const mostRecent = await getMostRecentPublishedFlow(flowId);
  const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

  // If no changes, then nothing to publish nor events to queue up
  if (!delta) return null;

  const hasSendComponent = hasComponentType(flattenedFlow, ComponentType.Send);
  const isStatutoryApplication =
    hasSendComponent && hasStatutoryApplicationType(flattenedFlow);

  const { client: $client } = getClient();
  const response = await $client.request<PublishFlow>(
    gql`
      mutation PublishFlow(
        $data: jsonb = {}
        $flow_id: uuid
        $publisher_id: Int
        $summary: String
        $has_send_component: Boolean
        $is_statutory_application_type: Boolean
      ) {
        publishedFlow: insert_published_flows_one(
          object: {
            data: $data
            flow_id: $flow_id
            publisher_id: $publisher_id
            summary: $summary
            has_send_component: $has_send_component
            is_statutory_application_type: $is_statutory_application_type
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
      is_statutory_application_type: isStatutoryApplication,
    },
  );

  const publishedFlow = response.publishedFlow && response.publishedFlow.data;

  const alteredNodes: Node[] = Object.keys(delta).map((key) => ({
    id: key,
    ...publishedFlow[key],
  }));

  // If we're publishing a source flow, queue up events to additionally update each of its' templated flows
  let templatedFlowsScheduledEventsResponse:
    | ScheduledEventResponse[]
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
            summary: summary,
          },
          comment: `publish_templated_flow_${templatedFlowId}`,
        }),
      ),
    );
  }

  return { alteredNodes, templatedFlowsScheduledEventsResponse };
};
