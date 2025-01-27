import {
  ComponentType,
  type FlowGraph,
} from "@opensystemslab/planx-core/types";
import { getValidSchemaValues } from "@opensystemslab/planx-core";
import { isComponentType } from "../../flowHelpers.js";

export const checkStatutoryApplicationTypes = (flattenedFlow: FlowGraph) => {
  const applicationTypes = getApplicationTypeVals(flattenedFlow);
  const validApplicationTypes = getValidSchemaValues("ApplicationType");
  const isStatutoryApplication = applicationTypes.some((value) =>
    validApplicationTypes?.includes(value),
  );
  return isStatutoryApplication;
};

const getApplicationTypeVals = (flowGraph: FlowGraph): string[] => {
  const nodesWithApplicationType = Object.entries(flowGraph)
    .map((node) => {
      const checkComponentTypes =
        isComponentType(node, ComponentType.Checklist) ||
        isComponentType(node, ComponentType.Question) ||
        isComponentType(node, ComponentType.SetValue);

      if (checkComponentTypes && node[1].data?.fn === "application.type") {
        return node[0]
      }

      return;
    })
    .filter((node) => node !== undefined);


  const answerVals: string[] = [];
  nodesWithApplicationType.forEach((node) => {
    console.log(flowGraph[node]);
    if(flowGraph[node].edges){
      flowGraph[node].edges.forEach((edge)=>typeof flowGraph[edge]?.data?.val === "string" && answerVals.push(flowGraph[edge]?.data?.val))
    }
    if (typeof flowGraph[node]?.data?.val === "string") {
      answerVals.push(flowGraph[node]?.data?.val);
    }
  });

  const uniqueAnswerVals = [...new Set(answerVals)];

  return uniqueAnswerVals;
};
