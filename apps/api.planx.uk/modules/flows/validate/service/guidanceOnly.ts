import {
  ComponentType,
  type FlowGraph,
  type FlowStatus,
} from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";

import { $public } from "../../../../client/index.js";
import { numberOfComponentType } from "../helpers.js";
import type { FlowValidationResponse } from "./index.js";

interface GetGuidanceOnlyFlowStatus {
  flow: {
    status: FlowStatus;
    team: {
      settings: {
        isGuidanceOnly: boolean | null;
      } | null;
    };
  } | null;
}

export const GUIDANCE_ONLY_SEND_MESSAGE =
  "Guidance only teams cannot publish a Send component to a service that is online in production";

/**
 * Prevent guidance-only teams from adding a 'Send' component to an already online flow
 * Only enforced in production
 */
export const isGuidanceOnlySendBlocked = async (
  flowId: string,
  flowGraph: FlowGraph,
): Promise<boolean> => {
  if (process.env.APP_ENVIRONMENT !== "production") return false;
  if (!numberOfComponentType(flowGraph, ComponentType.Send)) return false;

  const { flow } = await $public.client.request<GetGuidanceOnlyFlowStatus>(
    gql`
      query GetGuidanceOnlyFlowStatus($flowId: uuid!) {
        flow: flows_by_pk(id: $flowId) {
          status
          team {
            settings: team_settings {
              isGuidanceOnly: is_guidance_only
            }
          }
        }
      }
    `,
    { flowId },
  );

  return Boolean(
    flow?.status === "online" && flow.team.settings?.isGuidanceOnly,
  );
};

export const validateGuidanceOnly = async (
  flowId: string,
  flowGraph: FlowGraph,
): Promise<FlowValidationResponse | undefined> => {
  const isBlocked = await isGuidanceOnlySendBlocked(flowId, flowGraph);
  if (!isBlocked) return;

  return {
    title: "Guidance only",
    status: "Fail",
    message: `${GUIDANCE_ONLY_SEND_MESSAGE}. Remove the Send component or set this service offline before publishing.`,
  };
};
