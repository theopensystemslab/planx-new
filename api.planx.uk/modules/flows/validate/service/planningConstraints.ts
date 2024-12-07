import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
import { numberOfComponentType } from "../helpers.js";
import type { FlowValidationResponse } from "./index.js";

const validatePlanningConstraints = (
  flowGraph: FlowGraph,
): FlowValidationResponse => {
  const numberOfPlanningConstraintNodes = numberOfComponentType(
    flowGraph,
    ComponentType.PlanningConstraints,
  );
  if (numberOfPlanningConstraintNodes > 1) {
    return {
      title: "Planning Constraints",
      status: "Fail",
      message:
        "When using Planning Constraints, your flow must have exactly ONE Planning Constraints component",
    };
  } else if (numberOfPlanningConstraintNodes === 1) {
    // In future, add extra `hasPlanningData` validation step here to ensure integration is available for this team
    return {
      title: "Planning Constraints",
      status: "Pass",
      message: "Your flow has valid Planning Constraints",
    };
  } else {
    return {
      title: "Planning Constraints",
      status: "Not applicable",
      message: "Your flow is not using Planning Constraints",
    };
  }
};

export { validatePlanningConstraints };
