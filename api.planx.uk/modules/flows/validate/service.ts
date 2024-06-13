import * as jsondiffpatch from "jsondiffpatch";
import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers";
import intersection from "lodash/intersection";
import {
  ComponentType,
  Edges,
  FlowGraph,
  Node,
} from "@opensystemslab/planx-core/types";
import type { Entry } from "type-fest";

type AlteredNode = {
  id: string;
  type?: ComponentType;
  edges?: Edges;
  data?: Node["data"];
};

type ValidationResponse = {
  title: string;
  isValid: boolean;
  message: string;
};

interface ValidateAndDiffResponse {
  alteredNodes: AlteredNode[] | null;
  message: string;
  validationChecks?: ValidationResponse[];
}

const validateAndDiffFlow = async (
  flowId: string,
): Promise<ValidateAndDiffResponse> => {
  const flattenedFlow = await dataMerged(flowId);
  const mostRecent = await getMostRecentPublishedFlow(flowId);

  const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);
  if (!delta)
    return {
      alteredNodes: null,
      message: "No new changes to publish",
    };

  const alteredNodes = Object.keys(delta).map((key) => ({
    id: key,
    ...flattenedFlow[key],
  }));

  const validationChecks = [];
  const sections = validateSections(flattenedFlow);
  const inviteToPay = validateInviteToPay(flattenedFlow);
  validationChecks.push(sections, inviteToPay);

  return {
    alteredNodes,
    message: "Changes queued to publish",
    validationChecks: validationChecks,
  };
};

const validateSections = (flowGraph: FlowGraph): ValidationResponse => {
  if (getSectionNodeIds(flowGraph)?.length > 0) {
    if (!sectionIsInFirstPosition(flowGraph)) {
      return {
        title: "Sections",
        isValid: false,
        message: "When using Sections, your flow must start with a Section",
      };
    }

    if (!allSectionsOnRoot(flowGraph)) {
      return {
        title: "Sections",
        isValid: false,
        message:
          "Found Sections in one or more External Portals, but Sections are only allowed in main flow",
      };
    }
  }

  return {
    title: "Sections",
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
    title: "Invite to Pay",
    isValid: false,
  };

  if (inviteToPayEnabled(flowGraph)) {
    if (numberOfComponentType(flowGraph, ComponentType.Pay) > 1) {
      return {
        ...invalidResponseTemplate,
        message:
          "When using Invite to Pay, your flow must have exactly ONE Pay",
      };
    }

    if (!hasComponentType(flowGraph, ComponentType.Send)) {
      return {
        ...invalidResponseTemplate,
        message: "When using Invite to Pay, your flow must have a Send",
      };
    }

    if (numberOfComponentType(flowGraph, ComponentType.Send) > 1) {
      return {
        ...invalidResponseTemplate,
        message:
          "When using Invite to Pay, your flow must have exactly ONE Send. It can select many destinations",
      };
    }

    if (!hasComponentType(flowGraph, ComponentType.FindProperty)) {
      return {
        ...invalidResponseTemplate,
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
        ...invalidResponseTemplate,
        message:
          "When using Invite to Pay, your flow must have a Checklist that sets `proposal.projectType`",
      };
    }
  }

  return {
    title: "Invite to Pay",
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
