import { useQuery } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { getFlattenedFlowData } from "lib/api/flow/requests";
import { type Store,useStore } from "pages/FlowEditor/lib/store";
import Questions from "pages/Preview/Questions";
import React from "react";
import { updateStoreWithFlowData } from "utils/routeUtils/publicRouteHelpers";

export const FlattenedFlow: React.FC<{ mode: "preview" | "draft" }> = ({ mode }) => {
  const flowId = useStore((state) => state.id);

  const { data, isPending, error } = useQuery({
    queryKey: ["flattenedFlowData", mode, flowId],
    queryFn: () =>
      getFlattenedFlowData({
        flowId,
        isDraft: mode === "draft",
      }),
    // Never re-flatted without a refresh
    staleTime: Infinity,
  });

  if (isPending) return <DelayedLoadingIndicator />;
  if (error || !data ) throw error;

  updateStoreWithFlowData(data as Store.Flow);

  return <Questions previewEnvironment="standalone" />;
};