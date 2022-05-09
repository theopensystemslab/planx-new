import { TYPES as NodeTypes } from "@planx/components/types";
import { hasFeatureFlag } from "lib/featureFlags";
import { NaviRequest } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import { ApplicationPath } from "types";

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

export const setPath = (flowData: Record<string, any>, req: NaviRequest) => {
  if (!isSaveReturnFlow(flowData)) return;
  const path = req.params.sessionId
    ? ApplicationPath.Resume
    : ApplicationPath.SaveAndReturn;
  useStore.setState({ path });
};
