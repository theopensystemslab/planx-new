import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import Questions from "pages/Preview/Questions";
import React from "react";

export const PublishedFlow = () => {
  const isFlowLoaded = useStore((state) => state.isFlowLoaded);
  if (!isFlowLoaded) return <DelayedLoadingIndicator />;

  return <Questions previewEnvironment="standalone" />;
};
