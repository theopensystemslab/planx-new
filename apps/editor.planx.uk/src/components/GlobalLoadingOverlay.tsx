import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import LoadingOverlay from "./LoadingOverlay";

const GlobalLoadingOverlay: React.FC = () => {
  const isLoading = useStore((state) => state.isLoading);
  const loadingMessage = useStore((state) => state.loadingMessage);

  return <LoadingOverlay open={isLoading} message={loadingMessage} />;
};

export default GlobalLoadingOverlay;
