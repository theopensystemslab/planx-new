import { useQuery } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { getFlattenedFlowData } from "lib/api/flow/requests";
import { type Store } from "pages/FlowEditor/lib/store";
import Questions from "pages/Preview/Questions";
import React from "react";
import { updateStoreWithFlowData } from "utils/routeUtils/publicRouteHelpers";

interface Props {
  mode: "preview" | "draft";
  flowId: string;
}

/**
 * Helper component to lazily load flattened flow data
 *
 * Splitting this up from the main flow metdata fetch (settings, theme, etc) allows us to render the basic
 * layout asap without a blocking request
 *
 * Should always be accompanied by a prefetch (non-awaited) request on the route `loader()` function
 * to ensure we always kick off this long-running request immediately in the background
 */
export const FlattenedFlow: React.FC<Props> = ({ mode, flowId }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["flattenedFlowData", mode, flowId],
    queryFn: () =>
      getFlattenedFlowData({
        flowId,
        isDraft: mode === "draft",
      }),
    // Never re-flatten the flow without a refresh
    staleTime: Infinity,
  });

  if (isPending) return <DelayedLoadingIndicator />;
  if (error || !data) throw error;

  updateStoreWithFlowData(data as Store.Flow);

  return <Questions previewEnvironment="standalone" />;
};
