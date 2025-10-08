import type {
  ComponentType,
  Edges,
  FlowStatus,
  Node,
} from "@opensystemslab/planx-core/types";
import * as jsondiffpatch from "jsondiffpatch";

import {
  dataMerged,
  getHistory,
  getMostRecentPublishedFlow,
  getTemplatedFlows,
  type FlowHistoryEntry,
} from "../../../../helpers.js";
import { validateFees } from "./fees.js";
import { validateFileTypes } from "./fileTypes.js";
import { validateInviteToPay } from "./inviteToPay.js";
import { validatePlanningConstraints } from "./planningConstraints.js";
import { validateSections } from "./sections.js";
import { validateTemplatedNodes } from "./templatedNodes.js";

type AlteredNode = {
  id: string;
  type?: ComponentType;
  edges?: Edges;
  data?: Node["data"];
};

export type FlowValidationResponse = {
  title: string;
  status: "Pass" | "Fail" | "Warn" | "Not applicable";
  message: string;
};

interface FlowValidateAndDiffResponse {
  alteredNodes: AlteredNode[] | null;
  message: string;
  validationChecks?: FlowValidationResponse[];
  history: FlowHistoryEntry[] | null;
  templatedFlows?: {
    slug: string;
    team: {
      slug: string;
    };
    status: FlowStatus;
  }[];
}

const validateAndDiffFlow = async (
  flowId: string,
): Promise<FlowValidateAndDiffResponse> => {
  const flattenedFlow = await dataMerged(flowId);
  const mostRecent = await getMostRecentPublishedFlow(flowId);

  const delta = jsondiffpatch.diff(mostRecent, flattenedFlow);
  if (!delta)
    return {
      alteredNodes: null,
      history: null,
      message: "No new changes to publish",
    };

  // Only get alteredNodes, history, and do validationChecks if there have been changes
  const alteredNodes = Object.keys(delta).map((key) => ({
    id: key,
    ...flattenedFlow[key],
  }));

  const history = await getHistory(flowId);

  const validationChecks = [];
  const sections = validateSections(flattenedFlow);
  const fees = validateFees(flattenedFlow);
  const inviteToPay = validateInviteToPay(flattenedFlow);
  const fileTypes = validateFileTypes(flattenedFlow);
  const planningConstraints = validatePlanningConstraints(flattenedFlow);
  const templatedNodes = await validateTemplatedNodes(flowId, flattenedFlow);
  validationChecks.push(
    sections,
    fees,
    inviteToPay,
    fileTypes,
    planningConstraints,
    templatedNodes,
  );

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

  const { templatedFlows } = await getTemplatedFlows(flowId);

  return {
    alteredNodes,
    history,
    message: "Changes queued to publish",
    validationChecks: sortedValidationChecks,
    templatedFlows: templatedFlows,
  };
};

export { validateAndDiffFlow };
