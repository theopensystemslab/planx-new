import {
  ComponentType,
  type FlowGraph,
  type Node,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import * as jsondiffpatch from "jsondiffpatch";
import { getClient } from "../../../client/index.js";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers.js";
import { userContext } from "../../auth/middleware.js";
import { resolveNotification } from "../../notifications/service.js";
import { updateTemplatedFlow } from "../updateTemplatedFlow/service.js";
import { buildNodeTypeSet, createFlowTypeMap } from "../validate/helpers.js";

interface PublishFlow {
  publishedFlow: {
    id: string;
    flowId: string;
    publisherId: string;
    createdAt: string;
    data: FlowGraph;
    flow: {
      templatedFrom: string | null;
    };
  };
}

export const publishFlow = async (
  flowId: string,
  summary: string,
  templatedFlowIds?: string[],
): Promise<{
  alteredNodes: Node[];
  resolvedNotificationIds?: { id: number }[];
} | null> => {
  const userId = userContext.getStore()?.user?.sub;
  if (!userId) throw Error("User details missing from request");

  const flattenedFlow = await dataMerged(flowId);
  const mostRecent = await getMostRecentPublishedFlow(flowId);
  const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

  // If no changes, then nothing to publish nor events to queue up
  if (!delta) return null;

  const nodeTypeSet = buildNodeTypeSet(flattenedFlow);
  const hasSendComponent = nodeTypeSet.has(ComponentType.Send);
  const hasSections = nodeTypeSet.has(ComponentType.Section);

  const flowTypeMap = createFlowTypeMap(flattenedFlow);
  const payNodeIds = Array.from(
    flowTypeMap.get(ComponentType.Pay) ?? new Set<string>(),
  );

  const hasVisiblePayComponent = payNodeIds.some(
    (id) => !flattenedFlow[id]?.data?.hidePay,
  );

  const setFeeNodeIds = Array.from(
    flowTypeMap.get(ComponentType.SetFee) ?? new Set<string>(),
  );
  const hasEnabledServiceCharge = setFeeNodeIds.some(
    (id) => flattenedFlow[id]?.data?.applyServiceCharge,
  );

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
        $service_charge_enabled: Boolean
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
            service_charge_enabled: $service_charge_enabled
          }
        ) {
          id
          flowId: flow_id
          publisherId: publisher_id
          createdAt: created_at
          data
          flow {
            templatedFrom: templated_from
          }
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
      has_pay_component: hasVisiblePayComponent,
      service_charge_enabled: hasEnabledServiceCharge,
    },
  );

  const publishedFlow = response.publishedFlow && response.publishedFlow.data;

  const alteredNodes: Node[] = Object.keys(delta).map((key) => ({
    id: key,
    ...publishedFlow[key],
  }));

  // If we're publishing a source flow, directly update each templated flow without blocking the response
  if (templatedFlowIds && templatedFlowIds.length > 0) {
    Promise.all(
      templatedFlowIds.map((templatedFlowId) =>
        updateTemplatedFlow(flowId, templatedFlowId).catch((err) =>
          console.error(
            `Failed to update templated flow ${templatedFlowId}:`,
            err,
          ),
        ),
      ),
    );
  }

  // If we're publishing a templated flow, directly resolve any of its' active publish notifications
  let resolvedNotificationIds: { id: number }[] | undefined;
  if (response?.publishedFlow?.flow?.templatedFrom) {
    resolvedNotificationIds = await resolveNotification(
      flowId,
      "updated_templated_flow",
    );
  }

  return {
    alteredNodes,
    resolvedNotificationIds,
  };
};
