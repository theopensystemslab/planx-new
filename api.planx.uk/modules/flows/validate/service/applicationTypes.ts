import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
import { isComponentType } from "../helpers.js";
import { getValidSchemaValues } from "@opensystemslab/planx-core";

export const checkStatutoryApplicationTypes = (flattenedFlow: FlowGraph) => {
  const applicationTypes = getApplicationTypeVals(flattenedFlow);
  const validApplicationTypes = getValidSchemaValues("ApplicationType");
  const isStatutoryApplication = applicationTypes.some((value) =>
    validApplicationTypes?.includes(value),
  );
  return isStatutoryApplication;
};

const getApplicationTypeVals = (flowGraph: FlowGraph): string[] => {
  const applicationTypeChecklistNodes = Object.entries(flowGraph).filter(
    (entry) => {
      const checkComponentTypes =
        isComponentType(entry, ComponentType.Checklist) ||
        isComponentType(entry, ComponentType.Question) ||
        isComponentType(entry, ComponentType.SetValue);
      return checkComponentTypes && entry[1].data?.fn === "application.type";
    },
  );

  const answerVals: string[] = [];
  applicationTypeChecklistNodes.map(([_nodeId, node]) =>
    node.edges?.map((edgeId) => {
      if (typeof flowGraph[edgeId]?.data?.val === "string") {
        answerVals.push(flowGraph[edgeId]?.data?.val);
      }
    }),
  );

  return answerVals;
};
