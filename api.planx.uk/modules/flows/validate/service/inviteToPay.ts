import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";

import {
  hasComponentType,
  isComponentType,
  numberOfComponentType,
} from "../helpers.js";
import type { FlowValidationResponse } from "./index.js";

const validateInviteToPay = (flowGraph: FlowGraph): FlowValidationResponse => {
  if (inviteToPayEnabled(flowGraph)) {
    if (numberOfComponentType(flowGraph, ComponentType.Pay) > 1) {
      return {
        title: "Invite to Pay",
        status: "Fail",
        message:
          "When using Invite to Pay, your flow must have exactly ONE Pay",
      };
    }

    if (!hasComponentType(flowGraph, ComponentType.Send)) {
      return {
        title: "Invite to Pay",
        status: "Fail",
        message: "When using Invite to Pay, your flow must have a Send",
      };
    }

    if (numberOfComponentType(flowGraph, ComponentType.Send) > 1) {
      return {
        title: "Invite to Pay",
        status: "Fail",
        message:
          "When using Invite to Pay, your flow must have exactly ONE Send. It can select many destinations",
      };
    }

    if (!hasComponentType(flowGraph, ComponentType.FindProperty)) {
      return {
        title: "Invite to Pay",
        status: "Fail",
        message: "When using Invite to Pay, your flow must have a FindProperty",
      };
    }

    if (
      !hasComponentType(
        flowGraph,
        ComponentType.Checklist,
        "proposal.projectType",
      )
    ) {
      return {
        title: "Invite to Pay",
        status: "Fail",
        message:
          "When using Invite to Pay, your flow must have a Checklist that sets `proposal.projectType`",
      };
    }

    return {
      title: "Invite to Pay",
      status: "Pass",
      message: "Your flow has valid Invite to Pay",
    };
  }

  return {
    title: "Invite to Pay",
    status: "Not applicable",
    message: "Your flow is not using Invite to Pay",
  };
};

const inviteToPayEnabled = (flowGraph: FlowGraph): boolean => {
  const payNodes = Object.entries(flowGraph).filter((entry) =>
    isComponentType(entry, ComponentType.Pay),
  );
  const payNodeStatuses = payNodes.map(
    ([_nodeId, node]) => node?.data?.allowInviteToPay,
  );
  return (
    payNodeStatuses.length > 0 &&
    payNodeStatuses.every((status) => status === true)
  );
};

export { validateInviteToPay };
