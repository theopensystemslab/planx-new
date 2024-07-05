import { getValidSchemaValues } from "@opensystemslab/planx-core";
import {
  ComponentType,
  Edges,
  FlowGraph,
  Node,
} from "@opensystemslab/planx-core/types";
import * as jsondiffpatch from "jsondiffpatch";
import intersection from "lodash/intersection";

import { dataMerged, getMostRecentPublishedFlow } from "../../../helpers";
import {
  hasComponentType,
  isComponentType,
  numberOfComponentType,
} from "./helpers";

type AlteredNode = {
  id: string;
  type?: ComponentType;
  edges?: Edges;
  data?: Node["data"];
};

type ValidationResponse = {
  title: string;
  status: "Pass" | "Fail" | "Warn" | "Not applicable";
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

  // Only get alteredNodes and do validationChecks if there have been changes
  const alteredNodes = Object.keys(delta).map((key) => ({
    id: key,
    ...flattenedFlow[key],
  }));

  const validationChecks = [];
  const sections = validateSections(flattenedFlow);
  const inviteToPay = validateInviteToPay(flattenedFlow);
  const fileTypes = validateFileTypes(flattenedFlow);
  validationChecks.push(sections, inviteToPay, fileTypes);

  // Arrange list of validation checks in order of status: Fail, Warn, Pass, Not applicable
  const failingChecks = validationChecks.filter((v) => v.status == "Fail");
  const warningChecks = validationChecks.filter((v) => v.status === "Warn");
  const passingChecks = validationChecks.filter((v) => v.status === "Pass");
  const notApplicableChecks = validationChecks.filter(
    (v) => v.status === "Not applicable",
  );
  const sortedValidationChecks = failingChecks
    .concat(warningChecks)
    .concat(passingChecks)
    .concat(notApplicableChecks);

  return {
    alteredNodes,
    message: "Changes queued to publish",
    validationChecks: sortedValidationChecks,
  };
};

const validateSections = (flowGraph: FlowGraph): ValidationResponse => {
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

const validateInviteToPay = (flowGraph: FlowGraph): ValidationResponse => {
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

const validateFileTypes = (flowGraph: FlowGraph): ValidationResponse => {
  // Get all passport variables set by FileUpload and/or FileUploadAndLabel
  const allFileFns = [
    ...getFileUploadNodeFns(flowGraph),
    ...getFileUploadAndLabelNodeFns(flowGraph),
  ];
  if (allFileFns.length < 1) {
    return {
      title: "File types",
      status: "Not applicable",
      message: "Your flow is not using FileUpload or UploadAndLabel",
    };
  }

  // Get all file types supported by current release of ODP Schema & compare
  const validFileTypes = getValidSchemaValues("FileType");
  const invalidFileFns: string[] = [];
  allFileFns.forEach((fn) => {
    if (!validFileTypes?.includes(fn)) {
      invalidFileFns.push(fn);
    }
  });
  if (invalidFileFns.length > 0) {
    return {
      title: "File types",
      status: "Warn",
      message: `Your FileUpload or UploadAndLabel are setting data fields that are not supported by the ODP Schema: ${invalidFileFns.join(", ")}`,
    };
  }

  return {
    title: "File types",
    status: "Pass",
    message:
      "Files collected via FileUpload or UploadAndLabel are all supported by the ODP Schema",
  };
};

const getFileUploadNodeFns = (flowGraph: FlowGraph): string[] => {
  const fileUploadNodes = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] =>
      isComponentType(entry, ComponentType.FileUpload),
  );
  return fileUploadNodes.map(([_nodeId, node]) => node.data?.fn as string);
};

const getFileUploadAndLabelNodeFns = (flowGraph: FlowGraph): string[] => {
  // Exclude Upload & Label nodes used in "info-only" mode with a hidden dropzone
  const uploadAndLabelNodes = Object.entries(flowGraph).filter(
    (entry): entry is [string, Node] =>
      isComponentType(entry, ComponentType.FileUploadAndLabel) &&
      entry[1].data?.hideDropZone !== true,
  );
  const uploadAndLabelFileTypes = uploadAndLabelNodes
    .map(([_nodeId, node]) => node.data?.fileTypes)
    .flat();
  return uploadAndLabelFileTypes?.map((file: any) => file?.fn as string);
};

export { validateAndDiffFlow };
