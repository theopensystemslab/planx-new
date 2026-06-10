import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import isArray from "lodash/isArray.js";
import mergeWith from "lodash/mergeWith.js";

import { $api } from "../../../client/index.js";
import { getFlowData } from "../../../helpers.js";
import type { Flow } from "../../../types.js";

interface GetTemplatedFlowEdits {
  edits: {
    data: Flow["data"]; // Not `FlowGraph` because not required to have `_root` !
  }[];
}

interface UpdateTemplatedFlowData {
  flow: {
    data: FlowGraph;
  };
}

interface InsertComment {
  comment: {
    id: number;
  };
}

interface InsertNotification {
  notification: {
    id: number;
  };
}

type UpdateTemplatedFlowTransactionResponse = UpdateTemplatedFlowData &
  InsertComment &
  InsertNotification;

export const updateTemplatedFlow = async (
  sourceFlowId: string,
  templatedFlowId: string,
) => {
  const { data: sourceData, publishedFlows } = await getFlowData(sourceFlowId);
  const { publisherId: sourcePublisher, summary } = publishedFlows[0];

  const { teamId: templatedFlowTeamId } = await getFlowData(templatedFlowId);

  // Get templated flow edits (aka "customisations")
  //   Since initiated via a Hasura event, we don't have user context here and rely on $api client
  const templatedFlowEditsResponse =
    await $api.client.request<GetTemplatedFlowEdits>(
      gql`
        query GetTemplatedFlowEdits($flow_id: uuid!) {
          edits: templated_flow_edits(where: { flow_id: { _eq: $flow_id } }) {
            data
          }
        }
      `,
      {
        flow_id: templatedFlowId,
      },
    );
  const edits = templatedFlowEditsResponse.edits?.[0]?.data || {};

  // Apply templated flow edits on top of source data using Lodash's mergeWith (order of args matters!)
  const data = customMerge(sourceData, edits);

  // Batch updates into a single transaction to minimise number of network requests
  //   1) Set merged data as `flows.data` for templatedFlowId
  //   2) Insert a "History" comment for templatedFlowId to denote update with source summary & author
  //   3) Insert a new "Notification" that the templatedFlowId is ready to review & publish
  const updateTemplatedFlowTransactionResponse =
    await $api.client.request<UpdateTemplatedFlowTransactionResponse>(
      gql`
        mutation UpdateTemplatedFlowTransation(
          $data: jsonb!
          $flowId: uuid!
          $comment: String!
          $actorId: Int!
          $teamId: Int!
          $type: notification_type_enum_enum!
        ) {
          flow: update_flows_by_pk(
            pk_columns: { id: $flowId }
            _set: { data: $data }
          ) {
            data
          }
          comment: insert_flow_comments_one(
            object: { flow_id: $flowId, comment: $comment, actor_id: $actorId }
          ) {
            id
          }
          notification: insert_notifications_one(
            object: { flow_id: $flowId, team_id: $teamId, type: $type }
          ) {
            id
          }
        }
      `,
      {
        flowId: templatedFlowId,
        data: data,
        comment: `Source template published: "${summary}"`,
        actorId: sourcePublisher,
        teamId: templatedFlowTeamId,
        type: "updated_templated_flow",
      },
    );

  return {
    templatedFlowData: updateTemplatedFlowTransactionResponse.flow.data,
    commentId: updateTemplatedFlowTransactionResponse.comment.id,
    notificationId: updateTemplatedFlowTransactionResponse.notification.id,
  };
};

export const customMerge = (
  sourceData: Flow["data"], // FlowGraph ??
  edits: Flow["data"],
): Flow["data"] => {
  // Preserves edited empty arrays (eg if a templated folder is emptied)
  const mergedData = mergeWith(sourceData, edits, function (sourceData, edits) {
    if (isArray(sourceData)) {
      if (edits) {
        return edits;
      } else {
        return sourceData;
      }
    }
  });

  // Check for orphaned nodes IDS (deleted edges) and remove them to ensure graph displays correctly
  const validEdges = Object.values(mergedData).flatMap(
    (nodeData) => nodeData.edges,
  );
  const orphanedNodeIds = Object.keys(mergedData).filter(
    (nodeId) => nodeId !== "_root" && !validEdges.includes(nodeId),
  );
  orphanedNodeIds.forEach((nodeId) => {
    delete mergedData[nodeId];
  });

  return mergedData;
};
