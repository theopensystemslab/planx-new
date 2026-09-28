import {
  ComponentType,
  type FlowGraph,
  type Node,
} from "@opensystemslab/planx-core/types";

import { isComponentType } from "../../helpers.js";
import { hasComponentType } from "../helpers.js";
import type { FlowValidationResponse } from "./index.js";

export const validateDrawBoundary = (
  flowGraph: FlowGraph,
): FlowValidationResponse => {
  const drawBoundaryNodes = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] =>
      isComponentType(entry, ComponentType.DrawBoundary),
  );

  if (!drawBoundaryNodes.length) {
    return {
      title: "Draw boundary",
      status: "Not applicable",
      message: "Your flow is not using Draw boundary",
    };
  }

  const isSubmissionService = hasComponentType(flowGraph, ComponentType.Send);
  const hasHiddenFileUpload = drawBoundaryNodes.some(
    ([, node]) => node.data?.hideFileUpload === true,
  );
  const hasVisibleFileUpload = drawBoundaryNodes.some(
    ([, node]) => node.data?.hideFileUpload !== true,
  );

  if (isSubmissionService && hasHiddenFileUpload) {
    return {
      title: "Draw boundary",
      status: "Fail",
      message:
        "In submission services, Draw boundary components cannot be set to 'Hide file upload and allow user to continue without data'.",
    };
  }

  if (!isSubmissionService && hasVisibleFileUpload) {
    return {
      title: "Draw boundary",
      status: "Fail",
      message:
        "In non-submission services, Draw boundary components must be set to 'Hide file upload and allow user to continue without data'.",
    };
  }

  return {
    title: "Draw boundary",
    status: "Pass",
    message: "Your flow has valid Draw boundary components",
  };
};
