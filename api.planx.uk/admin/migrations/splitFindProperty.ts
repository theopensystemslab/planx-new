import { Request, Response, NextFunction } from 'express';
import { gql } from "graphql-request";
import { customAlphabet } from "nanoid-good";
import en from "nanoid-good/locale/en";

import { adminGraphQLClient as client } from "../../hasura";
import { Flow, PublishedFlow } from "../../types";

/**
 * This migration ran in February 2023
 * 
 * Context: FindProperty is split from two pages into two separate components (FindProperty + PlanningInformation) to faciliate overriding the "property.type"
 * 
 * What this does: Inserts a PlanningInformation component with default props (override = false) directly after a FindProperty in a flow schema. Additionally updates the currently published version of that flow
 * 
 * Considerations:
 *   - nodeIds for the new PlanningInformation must be unique among flows to prevent clone behavior if used as portals
 *   - a flow and its' currently published version need to share a nodeId so that it's not picked up in the publishing diff
 *   - we assume one FindProperty per flow
 *   - we assume no flow has PropertyInformation yet
 *   - we ignore external portal nodes when scanning a flow schema (external portals are flows and can be migrated independently)
 *   - we do not insert a corresponding operation, as "migrations" don't have actors, shouldn't need to be rolled-back, etc
 * 
 */

const findPropertyType: number = 9;

const defaultPropertyInformationNode: Record<"type" | "data", any> = {
  "type": 12,
  "data": {
    "title": "About the property",
    "description": "This is the information we currently have about the property",
    "showPropertyTypeOverride": false
  }
};

// aligns with editor.planx.uk/src/@planx/graph
const uniqueId = customAlphabet(en)(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  10
);

const splitFindProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | NextFunction | void> => {
  try {
    // TODO decide how to get/generate the list of flows we want to migrate
    const flows: string[] = [req.params.flowId];

    flows.forEach(async (flowId: string) => {
      const { flowData, publishedFlowId, publishedFlowData } = await getFlowAndPublishedFlowData(flowId);

      // check if we have a FindProperty node, this will be same nodeId between flowData and publishedFlowData
      let findPropertyNodeId: string | undefined;
      Object.keys(flowData).forEach((nodeId) => {
        if (flowData[nodeId]?.type === findPropertyType) {
          findPropertyNodeId = nodeId;
          return;
        }
      });

      // only proceed if this flow has a FindProperty node
      if (findPropertyNodeId) {
        // generate a unique nodeId for PropertyInformation
        const newNodeId = uniqueId();

        // insert the new PropertyInformation node into the flow
        Object.keys(flowData).forEach(async (nodeId) => {
          if (findPropertyNodeId && flowData[nodeId]?.edges?.includes(findPropertyNodeId)) {
            // order that new nodeId is inserted into edges matters
            const newNodeIndex = (flowData[nodeId]?.edges?.indexOf(findPropertyNodeId) || 0) + 1;
            flowData[nodeId]?.edges?.splice(newNodeIndex, 0, newNodeId);

            // order of flow keys does not matter, we can just tack onto the end
            flowData[newNodeId] = defaultPropertyInformationNode;

            // update flows.data
            await updateFlowData(flowId, flowData);

            // repeat for the published flow data if this flow is published
            if (publishedFlowData) {
              Object.keys(publishedFlowData).forEach(async (nodeId) => {
                if (findPropertyNodeId && publishedFlowData[nodeId]?.edges?.includes(findPropertyNodeId)) {
                  // this index may differ between flow and published_flow because of flattening
                  const newNodeIndex = (publishedFlowData[nodeId]?.edges?.indexOf(findPropertyNodeId) || 0) + 1;
                  publishedFlowData[nodeId]?.edges?.splice(newNodeIndex, 0, newNodeId);
                  publishedFlowData[newNodeId] = defaultPropertyInformationNode;
                  await updatePublishedFlowData(publishedFlowId, publishedFlowData);
                }
              });
            }
          }
        });
      }
    });

    res.send({ 
      message: "Migration successful", // TODO make this meaningful
      flows: flows,
    });
  } catch (error) {
    next(error);
  }
};

const getFlowAndPublishedFlowData = async (id: string): Promise<{ 
  "flowData": Flow["data"],
  "publishedFlowId": PublishedFlow["id"],
  "publishedFlowData": PublishedFlow["data"]
}> => {
  const data = await client.request(
    gql`
      query GetFlowAndPublishedFlowData($id: uuid!) {
        flows_by_pk(id: $id) {
          data
          published_flows(limit: 1, order_by: {created_at: desc}) {
            id
            data
          }
        }
      }
    `,
    { id }
  );

  return {
    flowData: data.flows_by_pk?.data,
    publishedFlowId: data.flows_by_pk?.published_flows?.[0]?.id,
    publishedFlowData: data.flows_by_pk?.published_flows?.[0]?.data,
  }
};

const updateFlowData = async (id: Flow["id"], data: Flow["data"]): Promise<Flow["id"]> => {
  const response = await client.request(
    gql`
      mutation UpdateFlow($id: uuid!, $data: jsonb) {
        update_flows_by_pk(pk_columns: {id: $id}, _set: {data: $data}) {
          id
        }
      }
    `,
    { id, data }
  );

  return response.update_flows_by_pk?.id
}

const updatePublishedFlowData = async (id: PublishedFlow["id"], data: PublishedFlow["data"]): Promise<PublishedFlow["id"]> => {
  const response = await client.request(
    gql`
      mutation UpdatePublishedFlow($id: Int!, $data: jsonb) {
        update_published_flows_by_pk(pk_columns: {id: $id}, _set: {data: $data}) {
          id
        }
      }
    `,
    { id, data }
  );

  return response.update_flows_by_pk?.id
}

export { splitFindProperty };
