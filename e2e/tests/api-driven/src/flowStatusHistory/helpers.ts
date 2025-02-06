import { FlowStatus } from "@opensystemslab/planx-core/types";
import { $admin } from "../client.js";
import { createTeam, createUser } from "../globalHelpers.js";
import { gql } from "graphql-tag";

export const setup = async () => {
  const teamId = await createTeam();
  const userId = await createUser();

  const world = { teamId, userId };

  return world;
};

export const cleanup = async () => {
  await $admin.flow._destroyPublishedAll();
  await $admin.flow._destroyAll();
  await $admin.user._destroyAll();
  await $admin.team._destroyAll();
};

interface GetFlowStatus {
  flows: {
    status: FlowStatus;
  };
}

export const getFlowStatus = async (flowId: string) => {
  const {
    flows: { status },
  } = await $admin.client.request<GetFlowStatus>(
    gql`
      query GetFlowStatus($flowId: uuid!) {
        flows: flows_by_pk(id: $flowId) {
          status
        }
      }
    `,
    { flowId },
  );

  return status;
};

interface GetFlowStatusHistory {
  flowStatusHistory: {
    id: number;
    status: FlowStatus;
    eventStart: string;
    eventEnd: string;
  }[];
}

export const getFlowStatusHistory = async (flowId: string) => {
  const { flowStatusHistory } =
    await $admin.client.request<GetFlowStatusHistory>(
      gql`
        query GetFlowStatusHistory($flowId: uuid!) {
          flowStatusHistory: flow_status_history(
            where: { flow_id: { _eq: $flowId } }
            order_by: { event_start: asc }
          ) {
            id
            status
            eventStart: event_start
            eventEnd: event_end
          }
        }
      `,
      { flowId },
    );

  return flowStatusHistory;
};
