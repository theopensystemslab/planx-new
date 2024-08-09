import { ComponentType, Edges, Node } from "@opensystemslab/planx-core/types";
import * as jsondiffpatch from "jsondiffpatch";

import { dataMerged, getMostRecentPublishedFlow } from "../../../../helpers.js";
import { validateFileTypes } from "./fileTypes.js";
import { validateInviteToPay } from "./inviteToPay.js";
import { validateSections } from "./sections.js";
import { validateProjectTypes } from "./projectTypes.js";

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
  const projectTypes = validateProjectTypes(flattenedFlow);
  validationChecks.push(sections, inviteToPay, fileTypes, projectTypes);

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

export { validateAndDiffFlow };
