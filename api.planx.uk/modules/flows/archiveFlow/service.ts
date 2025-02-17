import { gql } from "graphql-request";
import { getClient } from "../../../client/index.js";
import type { FlowId } from "@opensystemslab/planx-core/types";

export const archiveFlow = async (flowId: FlowId) => {
  const archivedFlow = await markFlowAsArchived(flowId);
  return archivedFlow;
};

interface ArchivedFlow {
  name: string;
  id: FlowId;
}

const markFlowAsArchived = async (flowId: FlowId): Promise<ArchivedFlow> => {
  const { client: $client } = getClient();
  const { flow } = await $client.request<{ flow: ArchivedFlow }>(
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
