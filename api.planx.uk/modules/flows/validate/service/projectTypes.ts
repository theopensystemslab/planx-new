import { getValidSchemaValues } from "@opensystemslab/planx-core";
import { ComponentType, FlowGraph } from "@opensystemslab/planx-core/types";
import countBy from "lodash/countBy";

import { isComponentType } from "../helpers";
import { FlowValidationResponse } from "./index";

const validateProjectTypes = (flowGraph: FlowGraph): FlowValidationResponse => {
  // Get all passport values set by Answers of Checklists that set fn "proposal.projectType"
  const projectTypeVals = getProjectTypeVals(flowGraph);
  if (projectTypeVals.length < 1) {
    return {
      title: "Project types",
      status: "Not applicable",
      message:
        'Your flow is not using Checklists which set "proposal.projectType"',
    };
  }

  // Get all project types supported by current release of ODP Schema & compare
  const validProjectTypes = getValidSchemaValues("ProjectType");
  const invalidProjectVals: string[] = [];
  projectTypeVals.forEach((val) => {
    if (!validProjectTypes?.includes(val)) {
      invalidProjectVals.push(val);
    }
  });
  if (invalidProjectVals.length > 0) {
    // Get unique fns with count of occurances
    const countInvalidProjectVals = countBy(invalidProjectVals);
    const summarisedInvalidProjectVals: string[] = [];
    Object.entries(countInvalidProjectVals).map(([k, v]: [string, number]) => {
      summarisedInvalidProjectVals.push(`${k} (${v})`);
    });
    return {
      title: "Project types",
      status: "Warn",
      message: `Your Checklists setting "proposal.projectType" include options that are not supported by the current release of the ODP Schema: ${summarisedInvalidProjectVals.join(", ")}`,
    };
  }

  return {
    title: "Project types",
    status: "Pass",
    message:
      "Project types set via Checklists are all supported by the ODP Schema",
  };
};

const getProjectTypeVals = (flowGraph: FlowGraph): string[] => {
  const projectTypeChecklistNodes = Object.entries(flowGraph).filter(
    (entry) =>
      isComponentType(entry, ComponentType.Checklist) &&
      entry[1].data?.fn === "proposal.projectType",
  );

  const answerVals: string[] = [];
  projectTypeChecklistNodes.map(([_nodeId, node]) =>
    node.edges?.map((edgeId) => {
      if (typeof flowGraph[edgeId]?.data?.val === "string") {
        answerVals.push(flowGraph[edgeId]?.data?.val);
      }
    }),
  );

  return answerVals;
};

export { validateProjectTypes };
