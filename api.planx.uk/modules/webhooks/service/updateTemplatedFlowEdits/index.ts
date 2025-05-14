import type { Node, NodeId } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import * as jsondiffpatch from "jsondiffpatch";
import { $api } from "../../../../client/index.js";
import { getFlowData } from "../../../../helpers.js";
import type { Flow } from "../../../../types.js";

export const updateTemplatedFlowEdits = async (
  flowId: string,
  templatedFrom: string,
  data: Flow["data"],
) => {
  // We fetch the live source template data, not its' latest published version, so it's a comparable diff to live incoming data
  //   Eg we need to pick up if external portal pointer flowIds have changed
  const sourceTemplate = await getFlowData(templatedFrom);
  const sourceTemplateData = sourceTemplate?.data;
  if (!sourceTemplateData) return;

  // Because the templated flow only enables editing of nodes tagged "customisation" or their children,
  //   the delta by default will only ever include nodes we need to record in `templated_flow_edits`
  const delta = jsondiffpatch.diff(sourceTemplateData, data);
  if (!delta) return;

  // For each changed node in the delta, store its' current data state only
  const templatedFlowEditsData: Record<NodeId, Node["data"]> = {};
  Object.entries(delta).forEach(([nodeId, nodeData]) => {
    const updatedNodeData: Node["data"] = {};
    const updatedKeys = Object.keys(nodeData?.data);
    updatedKeys.forEach((updatedKey) => {
      updatedNodeData[updatedKey] = data[nodeId]?.["data"]?.[updatedKey];
    });
    templatedFlowEditsData[nodeId] = updatedNodeData;
  });

  await $api.client.request<any>(
    gql`
      mutation UpdateTemplatedFlowEdits($flow_id: uuid!, $data: jsonb = {}) {
        templatedFlowEdits: update_templated_flow_edits(
          where: { flow_id: { _eq: $flow_id } }
          _set: { data: $data }
        ) {
          affected_rows
        }
      }
    `,
    {
      flow_id: flowId,
      data: templatedFlowEditsData,
    },
  );

  return { flowId, delta, templatedFlowEditsData };
};
