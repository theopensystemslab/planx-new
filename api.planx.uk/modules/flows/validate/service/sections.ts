import type { FlowGraph, Node } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";
import intersection from "lodash/intersection.js";

import type { FlowValidationResponse } from "./index.js";
import { isComponentType } from "../../helpers.js";

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
  // Sections can only be on the root directly, or within the first-level of an internal portal on its' root
  //   Note that flattening has converted all external portals to internals - so we distinguish "original" internal portals via `node.data.flattenedFromExternalPortal` = false/undefined
  const rootEdgeIds = flowData["_root"].edges;
  const internalPortalNodeIds = Object.entries(flowData)
    .filter(
      ([nodeId, nodeData]) =>
        nodeId !== "_root" &&
        (nodeData as Node)?.type === ComponentType.Folder &&
        !(nodeData as Node)?.data?.flattenedFromExternalPortal &&
        rootEdgeIds.includes(nodeId),
    )
    ?.flatMap(([nodeId, _nodeData]) => nodeId);
  const internalPortalEdgeIds = internalPortalNodeIds.flatMap(
    (nodeId) => flowData[nodeId]?.edges || [],
  );

  const validSectionPositions = rootEdgeIds.concat(internalPortalEdgeIds);

  const sectionTypeNodeIds = getSectionNodeIds(flowData);
  const intersectingNodeIds = intersection(
    validSectionPositions,
    sectionTypeNodeIds,
  );
  return intersectingNodeIds.length === sectionTypeNodeIds.length;
};

export { validateSections };
