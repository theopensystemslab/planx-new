import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import merge from "lodash/merge.js";
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

export const updateTemplatedFlow = async (
  sourceFlowId: string,
  templatedFlowId: string,
) => {
  const { data: sourceData, publishedFlows } = await getFlowData(sourceFlowId);
  const { publisher_id: sourcePublisher, summary } = publishedFlows[0];

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
  const edits = templatedFlowEditsResponse.edits[0].data;

  // Apply templated flow edits on top of source data using Lodash's deep merge
  const data = merge(sourceData, edits);

  // Set merged data as `flows.data` for templatedFlowId
  const updateFlowResponse = await $api.client.request<UpdateTemplatedFlowData>(
    gql`
      mutation Insert($data: jsonb!, $id: uuid!) {
        flow: update_flows_by_pk(
          pk_columns: { id: $id }
          _set: { data: $data }
        ) {
          data
        }
      }
    `,
    {
      data: data,
      id: templatedFlowId,
    },
  );

  // Insert a "History" comment for templatedFlowId to denote update with source summary & author
  const insertCommentResponse = await $api.client.request<InsertComment>(
    gql`
      mutation InsertComment(
        $flow_id: uuid!
        $comment: String!
        $actor_id: Int!
      ) {
        comment: insert_flow_comments_one(
          object: { flow_id: $flow_id, comment: $comment, actor_id: $actor_id }
        ) {
          id
        }
      }
    `,
    {
      flow_id: templatedFlowId,
      comment: `Updated based on source template publish with summary "${summary}"`,
      actor_id: sourcePublisher,
    },
  );

  return {
    templatedFlowData: updateFlowResponse.flow.data,
    commentId: insertCommentResponse.comment.id,
  };
};
