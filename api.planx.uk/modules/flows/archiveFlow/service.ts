import { gql } from "graphql-request";
import { getClient } from "../../../client/index.js";
import type { FlowId } from "@opensystemslab/planx-core/types";

export const archiveFlow = async (flowId: FlowId) => {
  const response = await updateDeleteAt(flowId);
  return response
};

interface UpdateFlow {
  name:string
  id: FlowId
}

const updateDeleteAt = async (
  flowId: FlowId,
): Promise<UpdateFlow> => {
  Date.now()
  const { client: $client } = getClient();
  const { flow } = await $client.request<{flow:UpdateFlow}>(
    gql`
      mutation ArchiveFlow($id: uuid!) {
        flow: update_flows_by_pk(
          pk_columns: { id: $id }
          _set: { deleted_at: "now()" }
        ) {
          id
          name
        }
      }
    `,
    {
      id: flowId,
    },
  );

  return flow;
};
