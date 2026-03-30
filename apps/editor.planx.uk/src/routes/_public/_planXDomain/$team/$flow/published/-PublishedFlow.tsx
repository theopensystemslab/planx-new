import { useQuery } from "@apollo/client";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { Store } from "pages/FlowEditor/lib/store";
import Questions from "pages/Preview/Questions";
import React from "react";
import { Route as PublishedLayoutRoute } from "routes/_public/_planXDomain/$team/$flow/published/route";
import { updateStoreWithFlowData } from "utils/routeUtils/publicRouteHelpers";
import { GET_PUBLISHED_FLOW_DATA } from "utils/routeUtils/publishedQueries";

export const PublishedFlow = () => {
  const { flow } = PublishedLayoutRoute.useRouteContext();

  const { data, loading, error } = useQuery<{ publishedFlows: { data: Store.Flow }[]}>(GET_PUBLISHED_FLOW_DATA, {
    variables: { flowId: flow.id },
    context: { role: "public" },
  });

  if (loading) return <DelayedLoadingIndicator />;
  if (error || !data ) throw error;

  updateStoreWithFlowData(data.publishedFlows[0].data);

  return <Questions previewEnvironment="standalone" />;
};