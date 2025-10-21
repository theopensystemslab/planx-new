import { useStore } from "pages/FlowEditor/lib/store";
import { OfflinePage } from "pages/OfflinePage";
import React, { PropsWithChildren } from "react";

const OfflineLayout = ({ children }: PropsWithChildren) => {
  const isFlowOnline = useStore.getState().flowStatus === "online";
  const searchParams = new URLSearchParams(window.location.search);
  const isUserResuming = Boolean(searchParams.get("sessionId"));

  // Allow users to complete Save & Return journeys, even if a flow is offline
  const isFlowAccessible = isFlowOnline || isUserResuming;

  return isFlowAccessible ? children : <OfflinePage />;
};

export default OfflineLayout;
