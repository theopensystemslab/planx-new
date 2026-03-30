import { useQuery } from "@apollo/client";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import Questions from "pages/Preview/Questions";
import React, { useEffect } from "react";
import { updateStoreWithFlowData } from "utils/routeUtils/publicRouteHelpers";
import { GET_PUBLISHED_FLOW_DATA } from "utils/routeUtils/publishedQueries";

/**
 * Helper component to lazily load flow data
 * 
 * Splitting this up from the main flow metdata fetch (settings, theme, etc) allows us to render the basic 
 * layout asap without a blocking request
 * 
 * Should always be accompanied by a prefetch (non-awaited) request on the route `loader()` function 
 * to ensure we always kick off this long-running request immediately in the background
 */
export const PublishedFlow: React.FC<{ flowId: string }> = ({ flowId }) => {
  const { data, loading, error } = useQuery<{ publishedFlows: { data: Store.Flow }[] }>(
    GET_PUBLISHED_FLOW_DATA,
    { variables: { flowId }, context: { role: "public" } },
  );

  const isStoreReady = useStore((state) => Object.keys(state.flow).length > 0);

  useEffect(() => {
    if (!data) return;
    updateStoreWithFlowData(data.publishedFlows[0].data);
  }, [data]);

  if (error) throw error;
  if (loading || !isStoreReady) return <DelayedLoadingIndicator />;

  return <Questions previewEnvironment="standalone" />;
};