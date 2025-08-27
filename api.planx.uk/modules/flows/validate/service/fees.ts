import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
import type { FlowValidationResponse } from "./index.js";
import { numberOfComponentType } from "../helpers.js";

const validateFees = (flowGraph: FlowGraph): FlowValidationResponse => {
  const hasPay = numberOfComponentType(flowGraph, ComponentType.Pay) > 0;

  if (hasPay) {
    if (numberOfComponentType(flowGraph, ComponentType.SetFee) < 1) {
      return {
        title: "Fees",
        status: "Fail",
        message:
          "When using Pay, your flow must also have a SetFee to generate an accurate fee breakdown",
      };
    } else {
      return {
        title: "Fees",
        status: "Pass",
        message: "Your flow has valid Pay using SetFee",
      };
    }
  } else {
    return {
      title: "Fees",
      status: "Not applicable",
      message: "Your flow is not using Pay",
    };
  }
};

export { validateFees };
