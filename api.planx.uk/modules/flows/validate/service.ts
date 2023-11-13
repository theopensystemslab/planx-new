import * as jsondiffpatch from "jsondiffpatch";
import { Request, Response, NextFunction } from "express";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers";
import intersection from "lodash/intersection";
import {
  ComponentType,
  FlowGraph,
  Node,
} from "@opensystemslab/planx-core/types";
import type { Entry } from "type-fest";

const validateAndDiffFlow = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | NextFunction | void> => {
  try {
    const flattenedFlow = await dataMerged(req.params.flowId);

    const {
      isValid: sectionsAreValid,
      message: sectionsValidationMessage,
      description: sectionsValidationDescription,
    } = validateSections(flattenedFlow);
    if (!sectionsAreValid) {
      return res.json({
        alteredNodes: null,
        message: sectionsValidationMessage,
        description: sectionsValidationDescription,
      });
    }

    const {
      isValid: payIsValid,
      message: payValidationMessage,
      description: payValidationDescription,
    } = validateInviteToPay(flattenedFlow);
    if (!payIsValid) {
      return res.json({
        alteredNodes: null,
        message: payValidationMessage,
        description: payValidationDescription,
      });
    }

    const mostRecent = await getMostRecentPublishedFlow(req.params.flowId);
    const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);

    if (delta) {
      const alteredNodes = Object.keys(delta).map((key) => ({
        id: key,
        ...flattenedFlow[key],
      }));

      return res.json({
        alteredNodes,
      });
    } else {
      return res.json({
        alteredNodes: null,
        message: "No new changes to publish",
      });
    }
  } catch (error) {
    return next(error);
  }
};

type ValidationResponse = {
  isValid: boolean;
  message: string;
  description?: string;
};

const validateSections = (flowGraph: FlowGraph): ValidationResponse => {
  if (getSectionNodeIds(flowGraph)?.length > 0) {
    if (!sectionIsInFirstPosition(flowGraph)) {
      return {
        isValid: false,
        message: "Cannot publish an invalid flow",
        description: "When using Sections, your flow must start with a Section",
      };
    }

    if (!allSectionsOnRoot(flowGraph)) {
      return {
        isValid: false,
        message: "Cannot publish an invalid flow",
        description:
          "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
      };
    }
  }

  return {
    isValid: true,
    message: "This flow has valid Sections or is not using Sections",
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

const validateInviteToPay = (flowGraph: FlowGraph): ValidationResponse => {
  const invalidResponseTemplate = {
    isValid: false,
    message: "Cannot publish an invalid flow",
  };

  if (inviteToPayEnabled(flowGraph)) {
    if (numberOfComponentType(flowGraph, ComponentType.Pay) > 1) {
      return {
        ...invalidResponseTemplate,
        description:
          "When using Invite to Pay, your flow must have exactly ONE Pay",
      };
    }

    if (!hasComponentType(flowGraph, ComponentType.Send)) {
      return {
        ...invalidResponseTemplate,
        description: "When using Invite to Pay, your flow must have a Send",
      };
    }

    if (numberOfComponentType(flowGraph, ComponentType.Send) > 1) {
      return {
        ...invalidResponseTemplate,
        description:
          "When using Invite to Pay, your flow must have exactly ONE Send. It can select many destinations",
      };
    }

    if (!hasComponentType(flowGraph, ComponentType.FindProperty)) {
      return {
        ...invalidResponseTemplate,
        description:
          "When using Invite to Pay, your flow must have a FindProperty",
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
        ...invalidResponseTemplate,
        description:
          "When using Invite to Pay, your flow must have a Checklist that sets the passport variable `proposal.projectType`",
      };
    }
  }

  return {
    isValid: true,
    message:
      "This flow is valid for Invite to Pay or is not using Invite to Pay",
  };
};

const inviteToPayEnabled = (flowGraph: FlowGraph): boolean => {
  const payNodes = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] =>
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

const isComponentType = (
  entry: Entry<FlowGraph>,
  type: ComponentType,
): entry is [string, Node] => {
  const [nodeId, node] = entry;
  if (nodeId === "_root") return false;
  return Boolean(node?.type === type);
};

const hasComponentType = (
  flowGraph: FlowGraph,
  type: ComponentType,
  fn?: string,
): boolean => {
  const nodeIds = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] => isComponentType(entry, type),
  );
  if (fn) {
    nodeIds
      ?.filter(([_nodeId, nodeData]) => nodeData?.data?.fn === fn)
      ?.map(([nodeId, _nodeData]) => nodeId);
  } else {
    nodeIds?.map(([nodeId, _nodeData]) => nodeId);
  }
  return Boolean(nodeIds?.length);
};

const numberOfComponentType = (
  flowGraph: FlowGraph,
  type: ComponentType,
  fn?: string,
): number => {
  const nodeIds = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] => isComponentType(entry, type),
  );
  if (fn) {
    nodeIds
      ?.filter(([_nodeId, nodeData]) => nodeData?.data?.fn === fn)
      ?.map(([nodeId, _nodeData]) => nodeId);
  } else {
    nodeIds?.map(([nodeId, _nodeData]) => nodeId);
  }
  return nodeIds?.length;
};

export { validateAndDiffFlow };
