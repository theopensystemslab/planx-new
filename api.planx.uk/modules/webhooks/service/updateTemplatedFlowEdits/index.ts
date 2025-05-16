import type { Node, NodeId } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import * as jsondiffpatch from "jsondiffpatch";
import isEmpty from "lodash/isEmpty.js";
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

  // For each changed node property in the delta, extract its' current data state only
  //   to store in templated_flow_edits (delta returns before and after state)
  const templatedFlowEditsData: Record<NodeId, Partial<Node>> = {};
  Object.entries(delta).forEach(([nodeId, nodeData]) => {
    const updatedNodeData: Node["data"] = {};
    const updatedKeys: string[] = nodeData?.data && Object.keys(nodeData.data);
    updatedKeys?.forEach((updatedKey) => {
      // TODO check how this handles removing properties eg 'description'
      updatedNodeData[updatedKey] = data[nodeId]?.["data"]?.[updatedKey];
    });

    const updatedEdges = nodeData?.edges;

    templatedFlowEditsData[nodeId] = {
      ...(Object.keys(updatedNodeData).length > 0 && { data: updatedNodeData }),
      ...(updatedEdges && { edges: data[nodeId]?.["edges"] }),
    };

    // If it's an entirely new node (Option type) that has been added, it won't
    //   have changed data & edges ({}) but rather need to capture whole node data
    Object.keys(templatedFlowEditsData).forEach((nodeId) => {
      if (isEmpty(templatedFlowEditsData[nodeId])) {
        templatedFlowEditsData[nodeId] = data[nodeId];
      }
    });
  });

  const response = await $api.client.request<any>(
    gql`
      mutation UpsertTemplatedFlowEdits($flow_id: uuid!, $data: jsonb = {}) {
        insert_templated_flow_edits_one(
          object: { flow_id: $flow_id, data: $data }
          on_conflict: {
            constraint: templated_flow_edits_flow_id_key
            update_columns: data
          }
        ) {
          id
          flow_id
          data
          created_at
          updated_at
        }
      }
    `,
    {
      flow_id: flowId,
      data: templatedFlowEditsData,
    },
  );

  return { flowId, delta, response };
};
