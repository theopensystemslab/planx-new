import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";

import { numberOfComponentType } from "../../../../modules/flows/validate/helpers.js";
import type { FlowValidationResponse } from "./index.js";

export const validateSend = (flowGraph: FlowGraph): FlowValidationResponse => {
  const numberSends = numberOfComponentType(flowGraph, ComponentType.Send);

  if (numberSends > 1) {
    return {
      title: "Send",
      status: "Fail",
      message: `Flows cannot have more than one Send component`,
    };
  }

  if (numberSends === 1) {
    return {
      title: "Send",
      status: "Pass",
      message: `Flow correctly has exactly one Send component`,
    };
  }

  return {
    title: "Send",
    status: "Not applicable",
    message: "Your flow is not a submission service",
  };
};
