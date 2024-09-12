import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import intersection from "lodash/intersection.js";

import { isComponentType } from "../helpers.js";
import type { FlowValidationResponse } from "./index.js";

const validateSections = (flowGraph: FlowGraph): FlowValidationResponse => {
  if (getSectionNodeIds(flowGraph)?.length > 0) {
    if (!sectionIsInFirstPosition(flowGraph)) {
      return {
        title: "Sections",
        status: "Fail",
        message: "When using Sections, your flow must start with a Section",
      };
    }

    if (!allSectionsOnRoot(flowGraph)) {
      return {
        title: "Sections",
        status: "Fail",
        message:
          "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
      };
    }

    return {
      title: "Sections",
      status: "Pass",
      message: "Your flow has valid Sections",
    };
  }

  return {
    title: "Sections",
    status: "Not applicable",
    message: "Your flow is not using Sections",
  };
};

const getSectionNodeIds = (flowGraph: FlowGraph): string[] => {
  const sectionNodes = Object.entries(flowGraph).filter((entry) =>
    isComponentType(entry, ComponentType.Section),
  );
  return sectionNodes.map(([nodeId, _nodeData]) => nodeId);
};

const sectionIsInFirstPosition = (flowGraph: FlowGraph): boolean => {
  const firstNodeId = flowGraph["_root"].edges[0];
  return flowGraph[firstNodeId].type === ComponentType.Section;
};

const allSectionsOnRoot = (flowData: FlowGraph): boolean => {
  const sectionTypeNodeIds = getSectionNodeIds(flowData);
  const intersectingNodeIds = intersection(
    flowData["_root"].edges,
    sectionTypeNodeIds,
  );
  return intersectingNodeIds.length === sectionTypeNodeIds.length;
};

export { validateSections };
