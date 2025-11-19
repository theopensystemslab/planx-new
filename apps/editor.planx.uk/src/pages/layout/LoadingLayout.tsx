import { useRouterState } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React, { PropsWithChildren } from "react";

export const loadingView = () => <LoadingLayout />;

export const LoadingLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouterState();
  const isLoading = router.isLoading;

  return isLoading ? <DelayedLoadingIndicator /> : <>{children}</>;
};
