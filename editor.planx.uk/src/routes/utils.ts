import { TYPES as NodeTypes } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";

export const makeTitle = (str: string) =>
  [str, "PlanX"].filter(Boolean).join(" | ");

export const rootFlowPath = (includePortals = false) => {
  const path = window.location.pathname.split("/").slice(0, 3).join("/");
  return includePortals ? path : path.split(",")[0];
};

export const isSaveReturnFlow = (flowData: Record<string, any>): Boolean =>
  hasFeatureFlag("SAVE_AND_RETURN") &&
  Boolean(
    Object.values(flowData).find(
      (node: Record<string, any>) => node.type === NodeTypes.Send
    )
  );
